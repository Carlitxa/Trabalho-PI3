
import React, { useState } from 'react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [role, setRole] = useState('utilizador');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [enderecoComercial, setEnderecoComercial] = useState('');
  const [sobre, setSobre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body: any = { email, senha, nomeCompleto, role };
      if (role === 'utilizador') body.nomeUsuario = nomeUsuario;
      if (role === 'empresa') {
        body.nomeEmpresa = nomeEmpresa;
        body.enderecoComercial = enderecoComercial;
        body.sobre = sobre;
      }
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao registrar');
      setSuccess('Conta criada com sucesso! Faça login.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 350, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 80, fontWeight: 700, letterSpacing: 2, marginBottom: 0, textShadow: '0 2px 16px #7c4dff88', background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JM</h1>
          <h2 style={{ fontWeight: 600, marginBottom: 32, fontSize: 24, textShadow: '0 2px 8px #7c4dff44', background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>REGISTE-SE PARA CRIAR UMA CONTA</h2>
          <h4 style={{ fontWeight: 500, marginBottom: 24, color: '#fff' }}>Preencha os dados abaixo</h4>
        </div>
        <form onSubmit={handleSubmit} style={{ width: 350, background: '#131828', borderRadius: 20, padding: 32 }}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              id="senha"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              id="nomeCompleto"
              placeholder="Nome Completo"
              value={nomeCompleto}
              onChange={e => setNomeCompleto(e.target.value)}
              required
              style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
            />
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, marginBottom: 16 }}
            >
              <option value="utilizador">Utilizador</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>
          {role === 'utilizador' && (
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                id="nomeUsuario"
                placeholder="Nome de Utilizador"
                value={nomeUsuario}
                onChange={e => setNomeUsuario(e.target.value)}
                required
                style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
              />
            </div>
          )}
          {role === 'empresa' && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="nomeEmpresa"
                  placeholder="Nome da Empresa"
                  value={nomeEmpresa}
                  onChange={e => setNomeEmpresa(e.target.value)}
                  required
                  style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="enderecoComercial"
                  placeholder="Endereço Comercial"
                  value={enderecoComercial}
                  onChange={e => setEnderecoComercial(e.target.value)}
                  required
                  style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  id="sobre"
                  placeholder="Sobre a Empresa"
                  value={sobre}
                  onChange={e => setSobre(e.target.value)}
                  required
                  style={{ background: '#01131C', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16, marginBottom: 16 }}
                />
              </div>
            </>
          )}
          {error && <div className="alert alert-danger" style={{ borderRadius: 10 }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ borderRadius: 10 }}>{success}</div>}
          <button type="submit" className="btn w-100 mb-2" disabled={loading} style={{ background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', color: '#fff', borderRadius: 20, fontWeight: 600, fontSize: 18, border: 'none', boxShadow: '0 2px 8px #0002' }}>
            {loading ? 'A criar...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
