import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsuarios, getSesionActiva, getUsuarioActivo, getRolActivo, setSesionActiva, setUsuarioActivo, setRolActivo, logout as logoutStorage } from '../lib/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sesion = getSesionActiva();
    const usuario = getUsuarioActivo();
    const rol = getRolActivo();
    
    setIsAuthenticated(sesion);
    setCurrentUser(usuario);
    setCurrentRole(rol);
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const usuarios = getUsuarios();
    const user = usuarios.find(u => u.usuario === username && u.password === password);
    
    if (user) {
      setSesionActiva(true);
      setUsuarioActivo(user.usuario);
      setRolActivo(user.rol);
      setIsAuthenticated(true);
      setCurrentUser(user.usuario);
      setCurrentRole(user.rol);
      return { success: true, rol: user.rol };
    }
    return { success: false, message: "Usuario o contraseña incorrectos" };
  };

  const logout = () => {
    logoutStorage();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentRole(null);
  };

  const register = (nombre, usuario, password, rol = 'cliente') => {
    const usuarios = getUsuarios();
    
    if (usuarios.find(u => u.usuario === usuario)) {
      return { success: false, message: "El usuario ya existe" };
    }
    
    if (password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
    }
    
    usuarios.push({ nombre, usuario, password, rol });
    setUsuarios(usuarios);
    
    return { success: true, message: "Usuario registrado correctamente" };
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      currentRole,
      loading,
      login,
      logout,
      register,
      isAdmin: currentRole === 'admin',
      isVendedor: currentRole === 'vendedor',
      isCliente: currentRole === 'cliente'
    }}>
      {children}
    </AuthContext.Provider>
  );
};