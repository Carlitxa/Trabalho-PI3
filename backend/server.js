const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const sequelize = require('./db');
const User = require('./models/User');
const Proposal = require('./models/Proposal');
const Department = require('./models/Department');
const Application = require('./models/Application');
const Company = require('./models/Company');

const app = express();
const PORT = 5000;

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'tmp/' });

const { Op } = require('sequelize');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Rotas para utilizador (user) no seu próprio perfil ---
// Ver o próprio perfil
app.get('/api/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  try {
    const user = await User.findByPk(userId, { attributes: { exclude: ['senha'] } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Atualizar o próprio perfil
app.put('/api/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    await user.update(req.body);
    res.json({ message: 'Perfil atualizado com sucesso', user });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
});

// Apagar o próprio utilizador
app.delete('/api/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    await user.destroy();
    res.json({ message: 'Conta eliminada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao eliminar conta', error: error.message });
  }
});

// Logout (simples, frontend apaga token)
app.post('/api/logout', (req, res) => {
  // No backend, apenas responde OK. O frontend remove o token/session.
  res.json({ message: 'Logout efetuado com sucesso' });
});
// CRUD de Departamentos (apenas admin)
app.post('/api/departamentos', checkAdminRole, async (req, res) => {
  try {
    const departamento = await Department.create(req.body);
    res.status(201).json(departamento);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar departamento', error: error.message });
  }
});

app.get('/api/departamentos', checkAdminRole, async (req, res) => {
  try {
    const departamentos = await Department.findAll();
    res.json(departamentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar departamentos' });
  }
});

app.get('/api/departamentos/:id', checkAdminRole, async (req, res) => {
  try {
    const departamento = await Department.findByPk(req.params.id);
    if (!departamento) return res.status(404).json({ message: 'Departamento não encontrado' });
    res.json(departamento);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar departamento' });
  }
});

app.put('/api/departamentos/:id', checkAdminRole, async (req, res) => {
  try {
    const departamento = await Department.findByPk(req.params.id);
    if (!departamento) return res.status(404).json({ message: 'Departamento não encontrado' });
    await departamento.update(req.body);
    res.json(departamento);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao editar departamento', error: error.message });
  }
});

app.delete('/api/departamentos/:id', checkAdminRole, async (req, res) => {
  try {
    const departamento = await Department.findByPk(req.params.id);
    if (!departamento) return res.status(404).json({ message: 'Departamento não encontrado' });
    await departamento.destroy();
    res.json({ message: 'Departamento eliminado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao eliminar departamento', error: error.message });
  }
});

// Associar gestor ao departamento (admin)
app.post('/api/departamentos/:id/associar-gestor', checkAdminRole, async (req, res) => {
  const { gestorId } = req.body;
  try {
    const departamento = await Department.findByPk(req.params.id);
    if (!departamento) return res.status(404).json({ message: 'Departamento não encontrado' });
    const gestor = await User.findByPk(gestorId);
    if (!gestor || gestor.role !== 'gestor') return res.status(404).json({ message: 'Gestor não encontrado' });
    // Supondo que Department tem um campo gestorId
    departamento.gestorId = gestorId;
    await departamento.save();
    res.json({ message: 'Gestor associado ao departamento com sucesso', departamento });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao associar gestor', error: error.message });
  }
});

// Simple middleware to check if user is admin
function checkAdminRole(req, res, next) {
  const role = req.headers['x-user-role']; // frontend must send user role in this header
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: apenas admin' });
  }
  next();
}

// Middleware para permitir apenas empresas, gestor e admin criar propostas
function checkCanCreateProposta(req, res, next) {
  const role = req.headers['x-user-role'];
  if (!['empresa', 'gestor', 'admin'].includes(role)) {
    return res.status(403).json({ message: 'Apenas empresas, gestor e admin podem criar propostas.' });
  }
  next();
}

// Middleware para permitir apenas empresas, gestor e admin editar propostas
function checkCanEditProposta(req, res, next) {
  const role = req.headers['x-user-role'];
  if (!['empresa', 'gestor', 'admin'].includes(role)) {
    return res.status(403).json({ message: 'Apenas empresas, gestor e admin podem editar propostas.' });
  }
  next();
}

// Middleware para permitir apenas gestor e admin apagar propostas
function checkCanDeleteProposta(req, res, next) {
  const role = req.headers['x-user-role'];
  if (!['gestor', 'admin'].includes(role)) {
    return res.status(403).json({ message: 'Apenas gestor e admin podem apagar propostas.' });
  }
  next();
}

app.get('/api/test', (req, res) => {
  res.json({ message: "API is working" });
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await User.findOne({ where: { email, senha } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    // You could add role info here for frontend:
    res.json({ token: 'fake-jwt-token', user }); // user.role is available on frontend
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Register route (public)
app.post('/api/register', async (req, res) => {
  const { email, senha, nomeCompleto, nomeUsuario, nomeEmpresa, enderecoComercial, sobre, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já registrado' });
    }

    let companyId = null;
    // Se for empresa, cria a empresa primeiro
    if (role === 'empresa') {
      const newCompany = await Company.create({
        name: nomeEmpresa,
        email,
        contactName: nomeCompleto,
        description: sobre,
        enderecoComercial
      });
      companyId = newCompany.id;
    }

    const newUser = await User.create({
      email,
      senha,
      nomeCompleto,
      role,
      ...(role === 'utilizador' && { nomeUsuario }),
      ...(role === 'empresa' && { nomeEmpresa, enderecoComercial, sobre, companyId }),
    });

    res.status(201).json({ message: 'Usuário registrado', user: newUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/api/delete-account', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await user.destroy();
    res.json({ message: "Conta eliminada com sucesso" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Erro ao eliminar conta" });
  }
});

// Delete user by ID route - only admin
app.delete('/api/admin/users/:id', checkAdminRole, async (req, res) => {
  const userId = req.params.id;
  const adminEmail = req.headers['x-user-email'];
  const adminPassword = req.headers['x-admin-password'];

  if (!adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'Admin email and password required' });
  }

  try {
    // Find the admin user by email
    const adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      return res.status(403).json({ message: 'Admin user not found' });
    }

    // Check if password matches (you should hash passwords in production!)
    if (adminPassword !== adminUser.senha) {
      return res.status(401).json({ message: 'Senha do administrador incorreta' });
    }

    // Now find the user to delete
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Delete the user
    await user.destroy();
    return res.json({ message: 'Conta eliminada com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Erro ao eliminar conta' });
  }
});

// Create new user (any role except 'admin') - only admin
app.post('/api/admin/users', checkAdminRole, async (req, res) => {
  const {
    email,
    senha,
    nomeCompleto,
    nomeUsuario,
    nomeEmpresa,
    enderecoComercial,
    sobre,
    role,
    nomeDepartamento,  // for departamento role
    formacao,          // for utilizador/student
    idade,
    emailInstitucional,
    emailPessoal,
  } = req.body;

  // Validate required fields depending on role
  if (!email || !senha || !nomeCompleto || !role) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  if (role === 'admin') {
    return res.status(403).json({ message: 'Não é permitido criar usuários com a role admin.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já está em uso.' });
    }

    // Build user data conditionally based on role
    const newUserData = {
      email,
      senha,
      nomeCompleto,
      role,
      // Fields for different roles:
      ...(role === 'utilizador' && { nomeUsuario, formacao, idade, emailInstitucional, emailPessoal }),
      ...(role === 'empresa' && { nomeEmpresa, enderecoComercial, sobre }),
      ...(role === 'departamento' && { nomeDepartamento }),
    };

    const newUser = await User.create(newUserData);

    res.status(201).json({ message: 'Usuário criado com sucesso.', user: newUser });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

app.post('/api/admin/import-students', checkAdminRole, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Arquivo CSV obrigatório.' });
  }

  const results = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Expecting CSV columns: nome, emailInstitucional, emailPessoal, formacao, idade
        results.push(data);
      })
      .on('end', async () => {
        fs.unlinkSync(filePath); // Delete temp file after reading

        const importedUsers = [];

        for (const row of results) {
          const {
            nome,
            emailInstitucional,
            emailPessoal,
            formacao,
            idade
          } = row;

          // Validate minimal required fields
          if (!nome || !emailInstitucional) {
            // Skip invalid rows, or optionally collect errors
            continue;
          }

          // Check if user exists by institutional email
          let user = await User.findOne({ where: { email: emailInstitucional } });

          if (user) {
            // Update existing user info (you can adjust fields)
            user.nomeCompleto = nome;
            user.emailPessoal = emailPessoal || user.emailPessoal;
            user.formacao = formacao || user.formacao;
            user.idade = idade || user.idade;
            await user.save();
          } else {
            // Create new user with role 'utilizador'
            user = await User.create({
              email: emailInstitucional,
              senha: 'default123', // Default password, consider sending reset email
              nomeCompleto: nome,
              emailPessoal: emailPessoal || null,
              formacao: formacao || null,
              idade: idade || null,
              role: 'utilizador',
            });
          }

          importedUsers.push(user);
        }

        res.json({ message: 'Importação concluída.', importedUsers });
      })
      .on('error', (err) => {
        console.error('CSV parse error:', err);
        fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Erro ao processar arquivo CSV.' });
      });
  } catch (error) {
    console.error('Erro na importação:', error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

app.post('/api/change-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email e nova senha são obrigatórios." });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // If you want, add more security checks here, like authentication token validation

    user.senha = newPassword;
    await user.save();

    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro interno ao alterar senha." });
  }
});


// Middleware para admin e gestor
function checkAdminOrGestor(req, res, next) {
  const role = req.headers['x-user-role'];
  if (!['admin', 'gestor'].includes(role)) {
    return res.status(403).json({ message: 'Acesso negado: apenas admin ou gestor' });
  }
  next();
}

// Ver todos os users (admin e gestor)
app.get('/api/admin/users', checkAdminOrGestor, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['senha'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Editar user (admin e gestor)
app.put('/api/admin/users/:id', checkAdminOrGestor, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao editar usuário', error: error.message });
  }
});

// Apagar user (admin e gestor)
app.delete('/api/admin/users/:id', checkAdminOrGestor, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    await user.destroy();
    res.json({ message: 'Usuário eliminado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao eliminar usuário', error: error.message });
  }
});



// Listar todas as empresas
app.get('/api/empresas', async (req, res) => {
  try {
    const empresas = await Company.findAll();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empresas' });
  }
});


// Editar empresa (admin, gestor, ou a própria empresa)
app.put('/api/empresas/:id', checkCanEditProposta, async (req, res) => {
  try {
    const empresa = await Company.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });

    // Verificação: empresa só pode editar a sua própria empresa
    const userRole = req.headers['x-user-role'];
    const userCompanyId = req.headers['x-user-company-id'];
    if (userRole === 'empresa') {
      if (!userCompanyId || String(empresa.id) !== String(userCompanyId)) {
        return res.status(403).json({ message: 'A empresa só pode editar a sua própria empresa.' });
      }
    }

    await empresa.update(req.body);
    res.json(empresa);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao editar empresa', error: error.message });
  }
});

// Eliminar empresa (apenas admin e gestor)
app.delete('/api/empresas/:id', checkCanEditProposta, async (req, res) => {
  try {
    const empresa = await Company.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
    await empresa.destroy();
    res.json({ message: 'Empresa eliminada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao eliminar empresa', error: error.message });
  }
});



// Listar todas as propostas
app.get('/api/propostas', async (req, res) => {
  try {
    const propostas = await Proposal.findAll();
    res.json(propostas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar propostas' });
  }
});

// Submeter nova proposta
app.post('/api/propostas', checkCanCreateProposta, async (req, res) => {
  try {
    // Garante que toda nova proposta tem status 'disponivel'
    const propostaData = { ...req.body, status: 'disponivel' };
    const proposta = await Proposal.create(propostaData);
    res.status(201).json(proposta);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao submeter proposta', error: error.message });
  }
});

// Editar proposta (admin, gestor, ou empresa dona)
app.put('/api/propostas/:id', checkCanEditProposta, async (req, res) => {
  try {
    const proposta = await Proposal.findByPk(req.params.id);
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada' });

    const userRole = req.headers['x-user-role'];
    const userCompanyId = req.headers['x-user-company-id'];
    if (userRole === 'empresa') {
      if (!userCompanyId || String(proposta.companyId) !== String(userCompanyId)) {
        return res.status(403).json({ message: 'A empresa só pode editar as suas próprias propostas.' });
      }
    }

    await proposta.update(req.body);
    res.json(proposta);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao editar proposta', error: error.message });
  }
});

// Apagar proposta (admin, gestor, ou empresa dona)
app.delete('/api/propostas/:id', checkCanDeleteProposta, async (req, res) => {
  try {
    const proposta = await Proposal.findByPk(req.params.id);
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada' });

    const userRole = req.headers['x-user-role'];
    const userCompanyId = req.headers['x-user-company-id'];
    if (userRole === 'empresa') {
      if (!userCompanyId || String(proposta.companyId) !== String(userCompanyId)) {
        return res.status(403).json({ message: 'A empresa só pode apagar as suas próprias propostas.' });
      }
    }

    await proposta.destroy();
    res.json({ message: 'Proposta apagada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao apagar proposta', error: error.message });
  }
});

// Apagar proposta
app.delete('/api/propostas/:id', checkCanDeleteProposta, async (req, res) => {
  try {
    const proposta = await Proposal.findByPk(req.params.id);
    if (!proposta) return res.status(404).json({ message: 'Proposta não encontrada' });
    await proposta.destroy();
    res.json({ message: 'Proposta apagada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao apagar proposta', error: error.message });
  }
});


// Buscar perfil do usuário (admin e gestor podem ver qualquer um)
app.get('/api/profile/:id', checkAdminOrGestor, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// CRUD para candidaturas (Application)

// Criar candidatura (estudante)
app.post('/api/candidaturas', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const { proposalId } = req.body;
  if (!userId || !proposalId) {
    return res.status(400).json({ message: 'userId e proposalId são obrigatórios' });
  }
  if (role !== 'utilizador') {
    return res.status(403).json({ message: 'Apenas utilizadores podem candidatar-se' });
  }
  try {
    // Verifica se já existe candidatura para esta proposta e user
    const existe = await Application.findOne({ where: { userId, proposalId } });
    if (existe) {
      return res.status(400).json({ message: 'Já existe candidatura para esta proposta' });
    }
    // Cria candidatura
    const candidatura = await Application.create({ userId, proposalId, status: 'pendente' });

    // Atualiza status da proposta para 'pendente' se não estiver 'ocupado'
    const proposta = await Proposal.findByPk(proposalId);
    if (proposta && proposta.status !== 'ocupado') {
      proposta.status = 'pendente';
      await proposta.save();
    }

    res.status(201).json(candidatura);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar candidatura', error: error.message });
  }
});


// Ver todas as candidaturas
app.get('/api/candidaturas', checkAdminOrGestor, async (req, res) => {
  try {
    const candidaturas = await Application.findAll();
    res.json(candidaturas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar candidaturas' });
  }
});

// Editar candidatura
app.put('/api/candidaturas/:id', checkAdminOrGestor, async (req, res) => {
  try {
    const candidatura = await Application.findByPk(req.params.id);
    if (!candidatura) return res.status(404).json({ message: 'Candidatura não encontrada' });
    const prevStatus = candidatura.status;
    await candidatura.update(req.body);

    // Se mudou de pendente para aceite, atualizar proposta para "ocupado"
    if (prevStatus === 'pendente' && candidatura.status === 'aceite') {
      const proposta = await Proposal.findByPk(candidatura.proposalId);
      if (proposta && proposta.status !== 'ocupada') {
        proposta.status = 'ocupada';
        await proposta.save();
      }
    }
    // Se mudou de pendente para rejeitada, atualizar proposta para "disponivel"
    if (prevStatus === 'pendente' && candidatura.status === 'rejeitada') {
      const proposta = await Proposal.findByPk(candidatura.proposalId);
      if (proposta && proposta.status !== 'disponivel') {
        proposta.status = 'disponivel';
        await proposta.save();
      }
    }

    res.json(candidatura);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao editar candidatura', error: error.message });
  }
});

// Apagar candidatura
app.delete('/api/candidaturas/:id', checkAdminOrGestor, async (req, res) => {
  try {
    const candidatura = await Application.findByPk(req.params.id);
    if (!candidatura) return res.status(404).json({ message: 'Candidatura não encontrada' });
    await candidatura.destroy();
    res.json({ message: 'Candidatura eliminada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao eliminar candidatura', error: error.message });
  }
});


// Aprovar candidatura e atualizar proposta
app.post('/api/candidaturas/:id/aprovar', checkAdminOrGestor, async (req, res) => {
  try {
    const candidatura = await Application.findByPk(req.params.id);
    if (!candidatura) return res.status(404).json({ message: 'Candidatura não encontrada' });

    candidatura.status = 'aceite';
    await candidatura.save();

    // Atualizar proposta para ocupado
    const proposta = await Proposal.findByPk(candidatura.proposalId);
    if (proposta) {
      proposta.status = 'ocupado';
      await proposta.save();
    }

    res.json({ message: 'Candidatura aprovada e proposta ocupada', candidatura });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao aprovar candidatura', error: error.message });
  }
});

// Rejeitar candidatura e atualizar proposta se necessário
app.post('/api/candidaturas/:id/rejeitar', checkAdminOrGestor, async (req, res) => {
  try {
    const candidatura = await Application.findByPk(req.params.id);
    if (!candidatura) return res.status(404).json({ message: 'Candidatura não encontrada' });

    candidatura.status = 'rejeitada';
    await candidatura.save();

    // Verifica se ainda há candidaturas aceites para a proposta
    const candidaturasAceites = await Application.count({
      where: { proposalId: candidatura.proposalId, status: 'aceite' }
    });
    if (candidaturasAceites === 0) {
      const proposta = await Proposal.findByPk(candidatura.proposalId);
      if (proposta) {
        proposta.status = 'disponivel';
        await proposta.save();
      }
    }

    res.json({ message: 'Candidatura rejeitada', candidatura });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao rejeitar candidatura', error: error.message });
  }
});

// Definir associações entre os models para garantir criação das tabelas relacionadas
User.belongsTo(Company, { foreignKey: 'companyId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });
Application.belongsTo(User, { foreignKey: 'userId' });
Application.belongsTo(Proposal, { foreignKey: 'proposalId' });
Proposal.belongsTo(Company, { foreignKey: 'companyId' });



// Sync DB and start server
sequelize.sync() // Não apaga dados, só cria tabelas se não existirem
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to sync database:', err);
  });
