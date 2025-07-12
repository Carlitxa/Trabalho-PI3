import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

interface Departamento {
  id: number;
  nome: string;
}

const Departamentos: React.FC = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nome: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userLS = localStorage.getItem('user');
    if (!userLS) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(userLS);
    if (userObj.role !== 'admin') {
      navigate('/home');
      return;
    }
    fetch('http://localhost:5000/api/departamentos', {
      headers: {
        'x-user-id': userObj.id,
        'x-user-role': userObj.role
      }
    })
      .then(res => res.json())
      .then(data => {
        // Garante que cada departamento tem campo 'nome'
        const normalizados = Array.isArray(data)
          ? data.map((d: any) => ({
              id: d.id,
              nome: d.nome || d.name || ''
            }))
          : [];
        setDepartamentos(normalizados);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const fetchDepartamentos = async () => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    const res = await fetch('http://localhost:5000/api/departamentos', {
      headers: {
        'x-user-id': userObj.id,
        'x-user-role': userObj.role
      }
    });
    const data = await res.json();
    // Garante que cada departamento tem campo 'nome'
    const normalizados = Array.isArray(data)
      ? data.map((d: any) => ({
          id: d.id,
          nome: d.nome || d.name || ''
        }))
      : [];
    setDepartamentos(normalizados);
  };

  const handleCreate = async () => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      // Envia tanto 'nome' quanto 'name' para garantir compatibilidade com backend
      const body = JSON.stringify({ nome: form.nome, name: form.nome });
      const response = await fetch('http://localhost:5000/api/departamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar departamento');
      setForm({ nome: '' });
      setShowForm(false);
      // Normaliza o departamento criado para garantir que tem campo 'nome'
      const novoDep = {
        id: data.id,
        nome: data.nome || data.name || ''
      };
      setDepartamentos([...departamentos, novoDep]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (dep: Departamento) => {
    setEditId(dep.id);
    setEditForm({ nome: dep.nome });
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  const handleSaveEdit = async (dep: Departamento) => {
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      // Envia tanto 'nome' quanto 'name' para garantir compatibilidade com backend
      const body = JSON.stringify({ nome: editForm.nome, name: editForm.nome });
      const response = await fetch(`http://localhost:5000/api/departamentos/${dep.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao editar departamento');
      setDepartamentos(departamentos.map(d => d.id === dep.id ? { ...d, nome: editForm.nome } : d));
      setEditId(null);
      alert('Departamento editado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar este departamento?')) return;
    const userLS = localStorage.getItem('user');
    if (!userLS) return;
    const userObj = JSON.parse(userLS);
    try {
      const response = await fetch(`http://localhost:5000/api/departamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      });
      if (!response.ok) throw new Error('Erro ao eliminar departamento');
      setDepartamentos(departamentos.filter(d => d.id !== id));
      alert('Departamento eliminado com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container mt-4">Carregando...</div>;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
      <div style={{ width: 110, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <Header vertical />
      </div>
      <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 28, marginBottom: 32, marginLeft: 40 }}>Departamentos</h2>
        <div style={{ width: '100%', maxWidth: 900, marginLeft: 40 }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ borderRadius: 20, fontWeight: 600, background: '#43ea7f', color: '#181A23', border: 'none', padding: '8px 24px', marginBottom: 12 }} onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Fechar' : 'Criar Departamento'}
            </button>
          </div>
          {showForm && (
            <form style={{ background: '#23243a', borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={e => { e.preventDefault(); handleCreate(); }}>
              <input style={{ width: 320, borderRadius: 12, marginBottom: 16, background: '#181b2a', color: '#fff', border: '1px solid #444' }} className="form-control" placeholder="Nome do departamento" value={form.nome} onChange={e => setForm({ nome: e.target.value })} required />
              <button className="btn btn-primary" style={{ borderRadius: 20, minWidth: 120, fontWeight: 600 }} type="submit">Criar</button>
            </form>
          )}
          <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 8 }}>
            {departamentos.length === 0 && (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>Nenhum departamento encontrado.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {departamentos.map(dep => (
                <div key={dep.id} style={{ background: '#23243a', borderRadius: 24, marginBottom: 0, padding: '32px 40px', boxShadow: '0 2px 16px #0002', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 80 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>ID: {dep.id}</div>
                    {editId === dep.id ? (
                      <input style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '8px 16px', width: '80%', marginBottom: 12 }} value={editForm.nome} onChange={e => setEditForm({ nome: e.target.value })} />
                    ) : (
                      <div style={{ color: '#b39ddb', fontSize: 18 }}>{dep.nome}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {editId === dep.id ? (
                      <>
                        <button style={{ borderRadius: 20, minWidth: 90, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 24px' }} onClick={() => handleSaveEdit(dep)}>Guardar</button>
                        <button style={{ borderRadius: 20, minWidth: 90, fontWeight: 600, background: '#6b7280', color: '#fff', border: 'none', padding: '8px 24px' }} onClick={handleCancelEdit}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button style={{ borderRadius: 20, minWidth: 90, fontWeight: 600, background: '#fbbf24', color: '#181A23', border: 'none', padding: '8px 24px' }} onClick={() => handleEdit(dep)}>Editar</button>
                        <button style={{ borderRadius: 20, minWidth: 90, fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', padding: '8px 24px' }} onClick={() => handleDelete(dep.id)}>Eliminar</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departamentos;
