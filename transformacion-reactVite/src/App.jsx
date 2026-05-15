import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { initializeData } from './lib/storage';
import Landing from './pages/Landing';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Admin from './pages/Admin';

// NUEVAS IMPORTACIONES
import Wishlist from './pages/Wishlist';
import Blog from './pages/Blog';
import Faq from './pages/Faq';
import Perfil from './pages/Perfil';

function App() {
  const { isAuthenticated, currentRole } = useAuth();

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/login" element={<Login />} />

      {/* NUEVAS RUTAS */}
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/perfil" element={<Perfil />} />

      <Route 
        path="/admin" 
        element={
          isAuthenticated && (currentRole === 'admin' || currentRole === 'vendedor') 
            ? <Admin /> 
            : <Navigate to="/login" />
        } 
      />
    </Routes>
  );
}

export default App;