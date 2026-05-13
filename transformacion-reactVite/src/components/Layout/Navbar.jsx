import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout as logoutStorage } from '../../lib/storage';

const Navbar = () => {
  const { isAuthenticated, currentUser, currentRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    logoutStorage();
    navigate('/');
  };

  const getNavLink = () => {
    if (isAuthenticated && currentRole === 'cliente') {
      return { text: `Hola, ${currentUser}`, href: '/carrito' };
    }
    if (isAuthenticated && currentRole !== 'cliente') {
      return { text: 'Panel', href: '/admin' };
    }
    return { text: 'Ingresar', href: '/admin' };
  };

  const navLink = getNavLink();

  return (
    <nav className="flex justify-between items-center gap-4 flex-wrap py-5 px-[8%]">
      <div className="text-3xl font-extrabold text-[#b83267]">FashionStore</div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/" className="font-semibold hover:text-[#d9467a] transition">Inicio</Link>
        <Link to="/catalogo" className="font-semibold hover:text-[#d9467a] transition">Catálogo</Link>
        <Link to="/carrito" className="font-semibold hover:text-[#d9467a] transition">Carrito</Link>
        <Link to="/contacto" className="font-semibold hover:text-[#d9467a] transition">Contacto</Link>
        
        {isAuthenticated && currentRole === 'cliente' && (
          <button onClick={handleLogout} className="btn-secondary">
            Salir
          </button>
        )}
        
        <Link 
          to={navLink.href} 
          className="bg-[#d9467a] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#b83267] transition"
        >
          {navLink.text}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;