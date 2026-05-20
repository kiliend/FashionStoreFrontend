// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/UI/Toast';

// Layouts
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Blog from './pages/Blog';
import Faq from './pages/Faq';
import Contacto from './pages/Contacto';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'vendedor', 'almacenero']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
