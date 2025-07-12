import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao autenticar');
      // Salvar token e user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirecionar para a página inicial após login
      window.location.href = '/home';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 80, fontWeight: 700, letterSpacing: 2, marginBottom: 0, textShadow: '0 2px 16px #7c4dff88', background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JM</h1>
          <h2 style={{ fontWeight: 600, marginBottom: 32, fontSize: 24, textShadow: '0 2px 8px #7c4dff44', background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MAIS DO QUE UM EMPREGO, UM FUTURO</h2>
          <h4 style={{ fontWeight: 500, marginBottom: 24, color: '#fff' }}>Entre na sua conta</h4>
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
          {error && <div className="alert alert-danger" style={{ borderRadius: 10 }}>{error}</div>}
          <button type="submit" className="btn w-100 mb-2" disabled={loading} style={{ background: 'linear-gradient(90deg, #7c4dff 0%, #b39ddb 100%)', color: '#fff', borderRadius: 20, fontWeight: 600, fontSize: 18, border: 'none', boxShadow: '0 2px 8px #0002' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: '#fff' }}>Não tem conta? <a href="/register" style={{ color: '#fff', textDecoration: 'underline' }}>Cadastre-se</a></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
