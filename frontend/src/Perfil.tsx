import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const Perfil: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userLS = localStorage.getItem('user');
    if (!userLS) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(userLS);
    fetch('http://localhost:5000/api/me', {
      headers: {
        'x-user-id': userObj.id
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao atualizar perfil');
      alert('Perfil atualizado com sucesso!');
      setUser(data.user);
      setEditMode(false);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja apagar sua conta? Esta ação é irreversível.')) return;
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id
        }
      });
      if (!response.ok) throw new Error('Erro ao eliminar conta');
      alert('Conta eliminada com sucesso!');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/logout');
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

if (!user) return (
  <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
    <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
      <Header vertical />
    </div>
    <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 64 }}>
      <div style={{ color: '#fff', fontSize: 22 }}>Usuário não encontrado.</div>
    </div>
  </div>
);

return (
  <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
    {/* Header lateral */}
    <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
      <Header vertical />
    </div>
    {/* Conteúdo principal com card mais à esquerda */}
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
      <div style={{ marginLeft: '8vw', width: '100%', maxWidth: 500 }}>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Meu Perfil</h2>
        <div style={{ background: '#23243a', borderRadius: 24, padding: '32px 40px', marginBottom: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          {!editMode ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 18 }}><b>Nome:</b> {user.nomeCompleto}</p>
              <p style={{ color: '#fff', fontSize: 18 }}><b>Email:</b> {user.email}</p>
              {user.nomeUsuario && <p style={{ color: '#fff', fontSize: 18 }}><b>Nome de Usuário:</b> {user.nomeUsuario}</p>}
              {user.nomeEmpresa && <p style={{ color: '#fff', fontSize: 18 }}><b>Empresa:</b> {user.nomeEmpresa}</p>}
              {user.enderecoComercial && <p style={{ color: '#fff', fontSize: 18 }}><b>Endereço:</b> {user.enderecoComercial}</p>}
              {user.sobre && <p style={{ color: '#fff', fontSize: 18 }}><b>Sobre:</b> {user.sobre}</p>}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                <button className="btn btn-primary me-2" style={{ borderRadius: 20, fontWeight: 600 }} onClick={() => setEditMode(true)}>Editar</button>
                <button className="btn btn-danger me-2" style={{ borderRadius: 20, fontWeight: 600 }} onClick={handleDelete}>Apagar Conta</button>
                <button className="btn btn-secondary" style={{ borderRadius: 20, fontWeight: 600 }} onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="mb-2">
                <label style={{ color: '#b39ddb', fontWeight: 500 }}>Nome</label>
                <input className="form-control" name="nomeCompleto" value={form.nomeCompleto || ''} onChange={handleChange} required style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
              </div>
              <div className="mb-2">
                <label style={{ color: '#b39ddb', fontWeight: 500 }}>Email</label>
                <input className="form-control" name="email" value={form.email || ''} onChange={handleChange} required style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
              </div>
              {user.nomeUsuario !== undefined && (
                <div className="mb-2">
                  <label style={{ color: '#b39ddb', fontWeight: 500 }}>Nome de Usuário</label>
                  <input className="form-control" name="nomeUsuario" value={form.nomeUsuario || ''} onChange={handleChange} style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
                </div>
              )}
              {user.nomeEmpresa !== undefined && (
                <>
                  <div className="mb-2">
                    <label style={{ color: '#b39ddb', fontWeight: 500 }}>Empresa</label>
                    <input className="form-control" name="nomeEmpresa" value={form.nomeEmpresa || ''} onChange={handleChange} style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
                  </div>
                  <div className="mb-2">
                    <label style={{ color: '#b39ddb', fontWeight: 500 }}>Endereço</label>
                    <input className="form-control" name="enderecoComercial" value={form.enderecoComercial || ''} onChange={handleChange} style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
                  </div>
                  <div className="mb-2">
                    <label style={{ color: '#b39ddb', fontWeight: 500 }}>Sobre</label>
                    <textarea className="form-control" name="sobre" value={form.sobre || ''} onChange={handleChange} style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16 }} />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                <button className="btn btn-success me-2" type="submit" style={{ borderRadius: 20, fontWeight: 600 }}>Guardar</button>
                <button className="btn btn-secondary" type="button" style={{ borderRadius: 20, fontWeight: 600 }} onClick={() => setEditMode(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default Perfil;
