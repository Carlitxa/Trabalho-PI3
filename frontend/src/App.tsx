import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Header from './Header';
import Register from './Register';
import Logout from './Logout';
import Propostas from './Propostas';
import Perfil from './Perfil';
import './App.css'
import Dashboard from './Dashboard';
import Departamentos from './Departamentos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRedirect />} />
        <Route path="/login" element={<AuthBlock><Login /></AuthBlock>} />
        <Route path="/register" element={<AuthBlock><Register /></AuthBlock>} />
        {/* Rota para a página inicial após login */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/propostas" element={<Layout><Propostas /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/departamentos" element={<Layout><Departamentos /></Layout>} />
        <Route path="/logout" element={<Logout />} />
        {/* Outras rotas futuras */}
      </Routes>
    </Router>
  );
}

function AuthBlock(props: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  if (user) return <Navigate to="/home" />;
  return <>{props.children}</>;
}

import { useLocation } from 'react-router-dom';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // Só mostra o Header horizontal se não estiver na Home, Dashboard ou Perfil
  if (
    location.pathname === '/home' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/perfil' ||
    location.pathname === '/departamentos' || 
    location.pathname === '/propostas'
  ) {
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      {children}
    </>
  );
}

function LoginRedirect() {
  // Se já está autenticado, vai para home, senão para login
  const user = localStorage.getItem('user');
  return user ? <Navigate to="/home" /> : <Navigate to="/login" />;
}

export default App
