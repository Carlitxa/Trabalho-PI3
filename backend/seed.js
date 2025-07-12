// Script para popular o banco de dados com dados iniciais
const sequelize = require('./db');
const User = require('./models/User');
const Company = require('./models/Company');
const Proposal = require('./models/Proposal');
const Department = require('./models/Department');
const Application = require('./models/Application');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    // Criar empresas (usando os campos corretos: name e email)
    const empresa1 = await Company.create({
      name: 'Tech Solutions',
      email: 'tech@empresa.com',
      enderecoComercial: 'Rua A, 123',
      sobre: 'Empresa de tecnologia.'
    });
    const empresa2 = await Company.create({
      name: 'InovaSoft',
      email: 'inova@empresa.com',
      enderecoComercial: 'Av. Central, 456',
      sobre: 'Soluções inovadoras.'
    });

    // Criar departamentos (usando o campo correto: name)
    const departamento1 = await Department.create({ name: 'Informática' });
    const departamento2 = await Department.create({ name: 'Gestão' });

    // Criar utilizadores
    const admin = await User.create({ email: 'admin@email.com', senha: 'admin123', nomeCompleto: 'Administrador', role: 'admin' });
    const gestor = await User.create({ email: 'gestor@email.com', senha: 'gestor123', nomeCompleto: 'Gestor', role: 'gestor', departmentId: departamento1.id });
    const user1 = await User.create({ email: 'user1@email.com', senha: 'user123', nomeCompleto: 'Utilizador Um', role: 'utilizador', nomeUsuario: 'utilizador1', formacao: 'Engenharia', idade: 22 });
    const user2 = await User.create({ email: 'user2@email.com', senha: 'user123', nomeCompleto: 'Utilizador Dois', role: 'utilizador', nomeUsuario: 'utilizador2', formacao: 'Gestão', idade: 23 });
    const empresaUser = await User.create({
      email: 'empresa@email.com',
      senha: 'empresa123',
      nomeCompleto: 'Empresa User',
      role: 'empresa',
      nomeEmpresa: empresa1.name,
      companyId: empresa1.id
    });

    // Criar propostas (usando os valores válidos do ENUM type: 'emprego', 'estágio', 'outra')
    const proposta1 = await Proposal.create({
      title: 'Estágio React',
      type: 'estágio',
      description: 'Desenvolvimento frontend em React.',
      status: 'pendente',
      companyId: empresa1.id
    });
    const proposta2 = await Proposal.create({
      title: 'Vaga Backend',
      type: 'emprego',
      description: 'Node.js e APIs.',
      status: 'pendente',
      companyId: empresa2.id
    });

    // Criar candidaturas
    await Application.create({ userId: user1.id, proposalId: proposta1.id, status: 'pendente' });
    await Application.create({ userId: user2.id, proposalId: proposta2.id, status: 'pendente' });

    console.log('Dados inseridos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    process.exit(1);
  }
}

seed();
