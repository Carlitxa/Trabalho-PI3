import React, { useEffect, useState } from 'react';
interface Departamento {
  id: number;
  nome: string;
}
import Header from './Header';
interface Proposal {
  id: number;
  title: string;
  type: string;
  status: string;
  description?: string;
  companyId?: number;
}
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  role: string;
  nomeUsuario?: string;
  nomeEmpresa?: string;
  enderecoComercial?: string;
  sobre?: string;
  departmentId?: number | null;
}

interface Company {
  id: number;
  name: string;
  email: string;
  contactName?: string;
  description?: string;
}

interface Application {
  id: number;
  userId: string;
  proposalId: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
  const [editCompanyForm, setEditCompanyForm] = useState<any>({});
  const [editAppId, setEditAppId] = useState<number | null>(null);
  const [editAppForm, setEditAppForm] = useState<any>({});
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userLS = localStorage.getItem('user');
    if (!userLS) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(userLS);
    if (!['admin', 'gestor'].includes(userObj.role)) {
      navigate('/home');
      return;
    }
    Promise.all([
      fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      }).then(res => res.json()),
      fetch('http://localhost:5000/api/empresas').then(res => res.json()),
      fetch('http://localhost:5000/api/candidaturas', {
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      }).then(res => res.json()),
      fetch('http://localhost:5000/api/propostas').then(res => res.json()),
      fetch('http://localhost:5000/api/departamentos', {
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      }).then(res => res.json())
    ])
      .then(([usersData, companiesData, applicationsData, proposalsData, departamentosData]) => {
        setUsers(usersData);
        setCompanies(companiesData);
        setApplications(applicationsData);
        setProposals(proposalsData);
        // Normaliza departamentos
        const normalizados = Array.isArray(departamentosData)
          ? departamentosData.map((d: any) => ({ id: d.id, nome: d.nome || d.name || '' }))
          : [];
        setDepartamentos(normalizados);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);
  // --- Candidaturas ---
  const handleEditApp = (app: Application) => {
    setEditAppId(app.id);
    setEditAppForm({ ...app });
  };

  const handleCancelEditApp = () => {
    setEditAppId(null);
  };

  const handleSaveEditApp = async (app: Application) => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/candidaturas/${app.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body: JSON.stringify(editAppForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao editar candidatura');
      setApplications(applications.map(a => a.id === app.id ? { ...a, ...editAppForm } : a));
      setEditAppId(null);
      alert('Candidatura editada com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta candidatura?')) return;
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/candidaturas/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      });
      if (!response.ok) throw new Error('Erro ao eliminar candidatura');
      setApplications(applications.filter(a => a.id !== id));
      alert('Candidatura eliminada com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };
  // --- Empresas ---
  const handleEditCompany = (company: Company) => {
    setEditCompanyId(company.id);
    setEditCompanyForm({ ...company });
  };

  const handleCancelEditCompany = () => {
    setEditCompanyId(null);
  };

  const handleSaveEditCompany = async (company: Company) => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/empresas/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body: JSON.stringify(editCompanyForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao editar empresa');
      setCompanies(companies.map(c => c.id === company.id ? { ...c, ...editCompanyForm } : c));
      setEditCompanyId(null);
      alert('Empresa editada com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta empresa?')) return;
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/empresas/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      });
      if (!response.ok) throw new Error('Erro ao eliminar empresa');
      setCompanies(companies.filter(c => c.id !== id));
      alert('Empresa eliminada com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este usuário?')) return;
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      });
      if (!response.ok) throw new Error('Erro ao eliminar usuário');
      setUsers(users.filter(u => u.id !== id));
      alert('Usuário eliminado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditForm({ ...user });
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  const handleSaveEdit = async (user: User) => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao editar usuário');
      setUsers(users.map(u => u.id === user.id ? { ...u, ...editForm } : u));
      setEditId(null);
      alert('Usuário editado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

if (loading) return (
  <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
    <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
      <Header vertical />
    </div>
    <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 64 }}>
      <div style={{ color: '#fff', fontSize: 22 }}>Carregando...</div>
    </div>
  </div>
);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex', overflow: 'hidden' }}>
      {/* Header lateral */}
      <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <Header vertical />
      </div>
      {/* Conteúdo principal */}
      <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 64, minHeight: '100vh', maxWidth: '100%', height: '100vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 28, marginBottom: 32 }}>Dashboard</h2>
        <div style={{ width: '100%', maxWidth: 900, marginBottom: 48 }}>
          <div style={{ background: '#23243a', borderRadius: 24, padding: '32px 40px', marginBottom: 32 }}>
            <h3 style={{ color: '#b39ddb', fontWeight: 600, fontSize: 22, marginBottom: 24 }}>Utilizadores</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', color: '#fff', background: 'transparent' }}>
                <thead>
                  <tr style={{ color: '#b39ddb', fontWeight: 500 }}>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      {editId === u.id ? (
                        <>
                          <td><input className="form-control" value={editForm.nomeCompleto || ''} onChange={e => setEditForm((f: any) => ({ ...f, nomeCompleto: e.target.value }))} /></td>
                          <td><input className="form-control" value={editForm.email || ''} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} /></td>
                          <td>
                            <select className="form-select" value={editForm.role} onChange={e => setEditForm((f: any) => ({ ...f, role: e.target.value }))}>
                              <option value="utilizador">Utilizador</option>
                              <option value="empresa">Empresa</option>
                              <option value="gestor">Gestor</option>
                              <option value="departamento">Departamento</option>
                            </select>
                            {/* Se for gestor, mostra dropdown de departamento */}
                            {editForm.role === 'gestor' && (
                              <select className="form-select mt-2" value={editForm.departmentId || ''} onChange={e => setEditForm((f: any) => ({ ...f, departmentId: e.target.value ? Number(e.target.value) : null }))}>
                                <option value="">Sem departamento</option>
                                {departamentos.map(dep => (
                                  <option key={dep.id} value={dep.id}>{dep.nome}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td>
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveEdit(u)}>Guardar</button>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancelar</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{u.nomeCompleto}</td>
                          <td>{u.email}</td>
                          <td>
                            {u.role}
                            {u.role === 'gestor' && u.departmentId && (
                              <span style={{ color: '#b39ddb', fontSize: 12, marginLeft: 8 }}>
                                — {departamentos.find(dep => dep.id === u.departmentId)?.nome || 'Sem departamento'}
                              </span>
                            )}
                          </td>
                          <td>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(u)}>Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Eliminar</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: '#23243a', borderRadius: 24, padding: '32px 40px', marginBottom: 32 }}>
            <h3 style={{ color: '#b39ddb', fontWeight: 600, fontSize: 22, marginBottom: 24 }}>Empresas</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', color: '#fff', background: 'transparent' }}>
                <thead>
                  <tr style={{ color: '#b39ddb', fontWeight: 500 }}>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Responsável</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      {editCompanyId === c.id ? (
                        <>
                          <td><input className="form-control" value={editCompanyForm.name || ''} onChange={e => setEditCompanyForm((f: any) => ({ ...f, name: e.target.value }))} /></td>
                          <td><input className="form-control" value={editCompanyForm.email || ''} onChange={e => setEditCompanyForm((f: any) => ({ ...f, email: e.target.value }))} /></td>
                          <td><input className="form-control" value={editCompanyForm.contactName || ''} onChange={e => setEditCompanyForm((f: any) => ({ ...f, contactName: e.target.value }))} /></td>
                          <td><input className="form-control" value={editCompanyForm.description || ''} onChange={e => setEditCompanyForm((f: any) => ({ ...f, description: e.target.value }))} /></td>
                          <td>
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveEditCompany(c)}>Guardar</button>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancelEditCompany}>Cancelar</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.contactName}</td>
                          <td>{c.description}</td>
                          <td>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditCompany(c)}>Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCompany(c.id)}>Eliminar</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: '#23243a', borderRadius: 24, padding: '32px 40px', marginBottom: 32 }}>
            <h3 style={{ color: '#b39ddb', fontWeight: 600, fontSize: 22, marginBottom: 24 }}>Candidaturas</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', color: '#fff', background: 'transparent' }}>
                <thead>
                  <tr style={{ color: '#b39ddb', fontWeight: 500 }}>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Proposta</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(a => {
                    const proposal = proposals.find(p => p.id === a.proposalId);
                    const proposalTitle = proposal ? proposal.title : 'proposta inexistente';
                    const user = users.find(u => u.id === a.userId);
                    const userName = user ? user.nomeCompleto : 'utilizador inexistente';
                    const isEditing = editAppId === a.id;
                    return (
                      <tr key={a.id}>
                        {isEditing ? (
                          <>
                            <td>{a.id}</td>
                            <td>{userName}</td>
                            <td>{proposalTitle}</td>
                            <td>
                              <select className="form-select" value={editAppForm.status} onChange={e => setEditAppForm((f: any) => ({ ...f, status: e.target.value }))} disabled={a.status === 'aceite' || a.status === 'rejeitada'}>
                                <option value="pendente">Pendente</option>
                                <option value="aceite">Aceite</option>
                                <option value="rejeitada">Rejeitada</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveEditApp(a)}>Guardar</button>
                              <button className="btn btn-secondary btn-sm" onClick={handleCancelEditApp}>Cancelar</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{a.id}</td>
                            <td>{userName}</td>
                            <td>{proposalTitle}</td>
                            <td>{a.status}</td>
                            <td>
                              <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditApp(a)}>Editar</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteApp(a.id)}>Eliminar</button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
