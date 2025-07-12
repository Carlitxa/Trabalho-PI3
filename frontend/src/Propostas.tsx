import React, { useEffect, useState } from 'react';
import Header from './Header';

interface Proposal {
  id: number;
  title: string;
  type: string;
  status: string;
  description?: string;
  companyId?: number;
}

interface Company {
  id: number;
  name: string;
}

const Propostas: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposal[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'estágio', description: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; type: string; description: string }>({ title: '', type: 'estágio', description: '' });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    // Busca propostas
    fetch('http://localhost:5000/api/propostas')
      .then(res => res.json())
      .then(data => {
        setPropostas(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao buscar propostas');
        setLoading(false);
      });
    // Busca empresas
    fetch('http://localhost:5000/api/empresas')
      .then(res => res.json())
      .then(data => setEmpresas(data))
      .catch(() => {});
  }, []);
  // Função para criar proposta
  const handleCriarProposta = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const userObj = JSON.parse(user);
    if (!userObj.companyId) {
      alert('Apenas empresas podem criar propostas.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/propostas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role,
          'x-user-company-id': String(userObj.companyId)
        },
        body: JSON.stringify({
          ...form,
          companyId: userObj.companyId,
          status: 'pendente',
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar proposta');
      alert('Proposta criada com sucesso!');
      setShowForm(false);
      setForm({ title: '', type: 'estágio', description: '' });
      // Atualiza lista de propostas
      fetch('http://localhost:5000/api/propostas')
        .then(res => res.json())
        .then(data => setPropostas(data));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Função para candidatar-se
  const handleCandidatar = async (propostaId: number) => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const userObj = JSON.parse(user);
    try {
      const response = await fetch('http://localhost:5000/api/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body: JSON.stringify({ proposalId: propostaId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao candidatar-se');
      alert('Candidatura submetida com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Função para eliminar proposta
  const handleEliminarProposta = async (propostaId: number) => {
    const user = localStorage.getItem('user');
    if (!user) return;
    const userObj = JSON.parse(user);
    if (!['admin', 'gestor'].includes(userObj.role)) return;
    if (!window.confirm('Tem certeza que deseja eliminar esta proposta?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/propostas/${propostaId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao eliminar proposta');
      alert('Proposta eliminada com sucesso!');
      setPropostas(propostas.filter(p => p.id !== propostaId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Função para abrir o form de edição
  const handleAbrirEditar = (proposta: Proposal) => {
    setEditId(proposta.id);
    setEditForm({
      title: proposta.title,
      type: proposta.type,
      description: proposta.description || ''
    });
  };

  // Função para cancelar edição
  const handleCancelarEditar = () => {
    setEditId(null);
  };

  // Função para submeter edição
  const handleSubmeterEditar = async (proposta: Proposal) => {
    const user = localStorage.getItem('user');
    if (!user) return;
    const userObj = JSON.parse(user);
    if (!['admin', 'gestor'].includes(userObj.role)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/propostas/${proposta.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userObj.id,
          'x-user-role': userObj.role
        },
        body: JSON.stringify({ ...proposta, ...editForm })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao editar proposta');
      alert('Proposta editada com sucesso!');
      setPropostas(propostas.map(p => p.id === proposta.id ? { ...p, ...editForm } : p));
      setEditId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
      {/* Header lateral */}
      <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <Header vertical />
      </div>
      {/* Conteúdo principal */}
      <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 64, height: '100vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 28, marginBottom: 32 }}>Propostas</h2>
        {/* Botão para empresas criarem proposta */}
        {(() => {
          const user = localStorage.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            if (userObj.role === 'empresa') {
              return (
                <div style={{ marginBottom: 32, width: '100%', maxWidth: 900 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <button style={{ borderRadius: 20, fontWeight: 600, background: '#43ea7f', color: '#181A23', border: 'none', padding: '8px 24px' }} onClick={() => setShowForm(v => !v)}>
                      {showForm ? 'Fechar' : 'Criar Proposta'}
                    </button>
                  </div>
                  {showForm && (
                    <form
                      style={{ background: '#23243a', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: 400, margin: '0 auto' }}
                      onSubmit={e => { e.preventDefault(); handleCriarProposta(); }}
                    >
                      <input
                        style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '10px 18px', width: '100%', marginBottom: 0 }}
                        placeholder="Título"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        required
                      />
                      <select
                        style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '10px 18px', width: '100%' }}
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        required
                      >
                        <option value="estágio">Estágio</option>
                        <option value="emprego">Emprego</option>
                        <option value="outra">Outra</option>
                      </select>
                      <textarea
                        style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '10px 18px', width: '100%', minHeight: 80 }}
                        placeholder="Descrição"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                      />
                      <button style={{ borderRadius: 20, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 32px', width: '100%', fontSize: 17 }} type="submit">Submeter</button>
                    </form>
                  )}
                </div>
              );
            }
          }
          return null;
        })()}
        {/* Listagem de propostas */}
        <div style={{ width: '100%', maxWidth: 900 }}>
          {propostas.map(proposta => {
            const user = localStorage.getItem('user');
            let podeCandidatar = false;
            let podeEditarOuEliminar = false;
            let userObj: any = null;
            if (user) {
              userObj = JSON.parse(user);
              podeCandidatar = userObj.role === 'utilizador' && proposta.status === 'disponivel';
              podeEditarOuEliminar = ['admin', 'gestor'].includes(userObj.role);
            }
            // Busca nome da empresa
            const empresa = empresas.find(e => e.id === proposta.companyId);
            const empresaNome = empresa ? empresa.name : proposta.companyId || 'N/A';
            const isEditing = editId === proposta.id;
            return (
              <div key={proposta.id} style={{ background: '#23243a', borderRadius: 24, marginBottom: 24, padding: '32px 40px', boxShadow: '0 2px 16px #0002' }}>
                {isEditing ? (
                  <form onSubmit={e => { e.preventDefault(); handleSubmeterEditar(proposta); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <input style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '8px 16px', width: '80%' }} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                      <select style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '8px 16px', width: '80%' }} value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} required>
                        <option value="estágio">Estágio</option>
                        <option value="emprego">Emprego</option>
                        <option value="outra">Outra</option>
                      </select>
                      <textarea style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, padding: '8px 16px', width: '80%' }} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} required />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '80%' }}>
                        <button style={{ borderRadius: 20, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 24px' }} type="submit">Guardar</button>
                        <button style={{ borderRadius: 20, fontWeight: 600, background: '#6b7280', color: '#fff', border: 'none', padding: '8px 24px' }} type="button" onClick={handleCancelarEditar}>Cancelar</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{proposta.title}</div>
                      {/* Empresa da proposta */}
                      <div style={{ color: '#b39ddb', fontSize: 15, marginBottom: 4 }}>
                        <b>Empresa:</b> {empresaNome}
                      </div>
                      <div style={{ color: '#b39ddb', fontSize: 15, marginBottom: 4 }}><b>Tipo:</b> {proposta.type}</div>
                      <div style={{ color: '#b39ddb', fontSize: 15, marginBottom: 4 }}><b>Status:</b> {proposta.status}</div>
                      {proposta.description && <div style={{ color: '#fff', fontSize: 15, marginBottom: 4 }}>{proposta.description}</div>}
                      {podeCandidatar && (
                        <button style={{ borderRadius: 20, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 24px', marginTop: 12 }} onClick={() => handleCandidatar(proposta.id)}>
                          Candidatar-se
                        </button>
                      )}
                    </div>
                    {podeEditarOuEliminar && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button style={{ borderRadius: 20, fontWeight: 600, background: '#fbbf24', color: '#181A23', border: 'none', padding: '8px 24px' }} onClick={() => handleAbrirEditar(proposta)}>
                          Editar
                        </button>
                        <button style={{ borderRadius: 20, fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', padding: '8px 24px' }} onClick={() => handleEliminarProposta(proposta.id)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Propostas;
