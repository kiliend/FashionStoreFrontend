// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getUsuarios, setUsuarios, getSesionActiva, getUsuarioActivo, 
  getRolActivo, setSesionActiva, setUsuarioActivo, setRolActivo, 
  logout as logoutStorage, addLog 
} from '../lib/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sesion = getSesionActiva();
    const usuario = getUsuarioActivo();
    const rol = getRolActivo();
    
    if (sesion && usuario) {
      const usuarios = getUsuarios();
      const userData = usuarios.find(u => u.usuario === usuario);
      setCurrentUserData(userData || null);
    }
    
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
      setCurrentUserData(user);
      addLog(`Inicio de sesión`, user.usuario, `Rol: ${user.rol}`);
      return { success: true, rol: user.rol, user };
    }
    return { success: false, message: "Usuario o contraseña incorrectos" };
  };

  const logout = () => {
    if (currentUser) {
      addLog(`Cierre de sesión`, currentUser, `Usuario cerró sesión`);
    }
    logoutStorage();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentRole(null);
    setCurrentUserData(null);
  };

  const register = (nombre, usuario, password, email, telefono, rol = 'cliente') => {
    const usuarios = getUsuarios();
    
    if (usuarios.find(u => u.usuario === usuario)) {
      return { success: false, message: "El usuario ya existe" };
    }
    
    if (password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
    }
    
    const nuevosUsuarios = [...usuarios, { nombre, usuario, password, email, telefono, rol }];
    setUsuarios(nuevosUsuarios);
    addLog(`Nuevo registro`, usuario, `Rol: ${rol}`);
    
    return { success: true, message: "Cuenta creada correctamente. Ahora puede iniciar sesión." };
  };

  const updateUser = (usuario, updates) => {
    const usuarios = getUsuarios();
    const userIndex = usuarios.findIndex(u => u.usuario === usuario);
    
    if (userIndex !== -1) {
      usuarios[userIndex] = { ...usuarios[userIndex], ...updates };
      setUsuarios(usuarios);
      addLog(`Usuario actualizado`, currentUser, `Usuario: ${usuario}`);
      return { success: true };
    }
    return { success: false, message: "Usuario no encontrado" };
  };

  const hasPermission = (allowedRoles) => {
    return allowedRoles.includes(currentRole);
  };

  const rolePermissions = {
    super_admin: ['all'],
    admin: ['users', 'products', 'sales', 'reports', 'suppliers', 'messages'],
    vendedor: ['products', 'sales', 'clients'],
    almacenero: ['products', 'stock', 'suppliers', 'purchase_orders'],
    cliente: ['shop', 'cart', 'profile']
  };

  const can = (permission) => {
    if (currentRole === 'super_admin') return true;
    const userPermissions = rolePermissions[currentRole] || [];
    return userPermissions.includes(permission) || userPermissions.includes('all');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      currentRole,
      currentUserData,
      loading,
      login,
      logout,
      register,
      updateUser,
      hasPermission,
      can,
      isSuperAdmin: currentRole === 'super_admin',
      isAdmin: currentRole === 'admin',
      isVendedor: currentRole === 'vendedor',
      isAlmacenero: currentRole === 'almacenero',
      isCliente: currentRole === 'cliente'
    }}>
      {children}
    </AuthContext.Provider>
  );
};