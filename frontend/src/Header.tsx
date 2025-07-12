import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaTachometerAlt, FaUser, FaBuilding } from 'react-icons/fa';

interface HeaderProps {
  vertical?: boolean;
}

const Header: React.FC<HeaderProps> = ({ vertical }) => {
  const navigate = useNavigate();
  // Recupera o user do localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {}
  const role = user?.role;

  if (vertical) {
    return (
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%' }}>
        {/* Logo JM */}
        <div style={{ marginBottom: 32, marginTop: 8 }}>
          <Link to="/home" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: 2, color: '#7c4dff', textShadow: '0 2px 16px #7c4dff88' }}>JM</span>
          </Link>
        </div>
        {/* Propostas: visível para todos */}
        <Link to="/propostas" title="Propostas" style={{ color: '#8B2CF5' }}>
          <FaFileAlt size={28} />
        </Link>
        {/* Dashboard: só admin e gestor */}
        {(role === 'admin' || role === 'gestor') && (
          <Link to="/dashboard" title="Dashboard" style={{ color: '#8B2CF5' }}>
            <FaTachometerAlt size={28} />
          </Link>
        )}
        {/* Departamentos: só admin */}
        {role === 'admin' && (
          <Link to="/departamentos" title="Departamentos" style={{ color: '#8B2CF5' }}>
            <FaBuilding size={28} />
          </Link>
        )}
        {/* Perfil: sempre visível */}
        <Link to="/perfil" title="Perfil" style={{ color: '#8B2CF5' }}>
          <FaUser size={28} />
        </Link>
      </nav>
    );
  }
  // Layout horizontal (navbar)
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">Plataforma</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center" style={{ gap: 10 }}>
            {/* Propostas: visível para todos */}
            <li className="nav-item">
              <Link className="nav-link" to="/propostas" title="Propostas">
                <FaFileAlt size={22} />
              </Link>
            </li>
            {/* Dashboard: só admin e gestor */}
            {(role === 'admin' || role === 'gestor') && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" title="Dashboard">
                  <FaTachometerAlt size={22} />
                </Link>
              </li>
            )}
            {/* Departamentos: só admin */}
            {role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/departamentos" title="Departamentos">
                  <FaBuilding size={22} />
                </Link>
              </li>
            )}
            {/* Perfil: sempre visível */}
            <li className="nav-item">
              <Link className="nav-link" to="/perfil" title="Perfil">
                <FaUser size={22} />
              </Link>
            </li>
            {/* Logout removido do header */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
