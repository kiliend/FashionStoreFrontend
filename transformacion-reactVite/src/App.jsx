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