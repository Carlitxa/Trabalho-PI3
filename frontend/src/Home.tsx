
import React, { useEffect, useState } from 'react';
import Header from './Header';

interface Company {
  id: number;
  name: string;
  email: string;
  enderecoComercial?: string;
  sobre?: string;
  description?: string;
}

const Home: React.FC = () => {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Protege a rota: só deixa acessar se estiver autenticado
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetch('http://localhost:5000/api/empresas')
      .then(res => res.json())
      .then(data => {
        // Mapeia os campos do backend para o frontend
        const mapped = data.map((empresa: any) => ({
          id: empresa.id,
          name: empresa.name,
          email: empresa.email,
          enderecoComercial: empresa.enderecoComercial,
          sobre: empresa.sobre,
          description: empresa.description,
        }));
        setEmpresas(mapped);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao buscar empresas');
        setLoading(false);
      });
  }, []);

  // Filtra empresas pelo nome (case insensitive)
  const empresasFiltradas = empresas.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#131828', display: 'flex' }}>
      {/* Header lateral */}
      <div style={{ width: 90, background: '#181A23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <Header vertical />
      </div>
      {/* Conteúdo principal */}
      <div style={{ flex: 1, padding: '48px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 64 }}>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 28, marginBottom: 32 }}>Empresas em destaque</h2>
        <div style={{ width: 400, marginBottom: 32 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Procurar empresa pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: '#181A23', color: '#fff', border: 'none', borderRadius: 20, paddingLeft: 20, fontSize: 16 }}
          />
        </div>
        {loading && <div style={{ color: '#fff' }}>Carregando...</div>}
        {error && <div className="alert alert-danger" style={{ borderRadius: 10 }}>{error}</div>}
        <div style={{ width: '100%', maxWidth: 900 }}>
          {empresasFiltradas.map(empresa => (
            <div key={empresa.id} style={{ background: '#23243a', borderRadius: 24, marginBottom: 24, padding: '32px 40px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 16px #0002' }}>
              {/* Logo fictício ou inicial */}
              <div style={{ width: 120, height: 60, background: '#131828', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 32 }}>
                {/* Se tiver uma imagem, pode mostrar aqui. Senão, mostra as iniciais */}
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>{empresa.name.split(' ').map(w => w[0]).join('')}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{empresa.name}</div>
                {empresa.enderecoComercial && <div style={{ color: '#b39ddb', fontSize: 15, marginBottom: 4 }}>{empresa.enderecoComercial}</div>}
                {(empresa.sobre || empresa.description) && (
                  <div style={{ color: '#fff', fontSize: 15, marginBottom: 4 }}>{empresa.sobre || empresa.description}</div>
                )}
                <div style={{ color: '#b39ddb', fontSize: 14 }}>{empresa.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
