// src/contexts/AuthContext.jsx
// MEJORA 16-20: Contexto de autenticación mejorado

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUsuarios, setUsuarios, addLog } from '../lib/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState({});

  // MEJORA 16: Verificar sesión al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('currentUser');
        const userData = localStorage.getItem('currentUserData');
        const role = localStorage.getItem('currentRole');
        
        if (user && userData && role) {
          setCurrentUser(user);
          setCurrentUserData(JSON.parse(userData));
          setCurrentRole(role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // MEJORA 17: Función de login con seguridad mejorada
  const login = (username, password) => {
    try {
      // Verificar intentos fallidos
      const attempts = loginAttempts[username] || 0;
      if (attempts >= 5) {
        return { success: false, message: 'Demasiados intentos. Intente más tarde.' };
      }

      const usuarios = getUsuarios();
      const user = usuarios.find(u => u.username === username && u.password === password);
      
      if (!user) {
        setLoginAttempts(prev => ({ ...prev, [username]: attempts + 1 }));
        addLog('Intento de login fallido', username, 'Credenciales incorrectas', 'warning');
        return { success: false, message: 'Usuario o contraseña incorrectos' };
      }

      // Resetear intentos
      setLoginAttempts(prev => ({ ...prev, [username]: 0 }));
      
      // Actualizar último login
      const usuariosActualizados = usuarios.map(u => 
        u.id === user.id ? { ...u, ultimoLogin: new Date().toISOString() } : u
      );
      setUsuarios(usuariosActualizados);
      
      // Guardar sesión
      localStorage.setItem('currentUser', user.username);
      localStorage.setItem('currentUserData', JSON.stringify(user));
      localStorage.setItem('currentRole', user.rol);
      
      setCurrentUser(user.username);
      setCurrentUserData(user);
      setCurrentRole(user.rol);
      setIsAuthenticated(true);
      
      addLog('Login exitoso', user.username, `Rol: ${user.rol}`, 'info');
      
      return { success: true, message: 'Bienvenido' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  // MEJORA 18: Función de registro mejorada
  const register = (nombre, username, password, email = '') => {
    try {
      const usuarios = getUsuarios();
      
      // Verificar usuario existente
      if (usuarios.some(u => u.username === username)) {
        return { success: false, message: 'El usuario ya existe' };
      }
      
      // Validar contraseña
      if (password.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
      }
      
      // Crear nuevo usuario (siempre como cliente)
      const nuevoUsuario = {
        id: Date.now(),
        nombre,
        username,
        password,
        email: email || `${username}@cliente.com`,
        rol: 'cliente',
        fechaRegistro: new Date().toISOString(),
        activo: true
      };
      
      usuarios.push(nuevoUsuario);
      setUsuarios(usuarios);
      addLog('Registro exitoso', username, 'Nuevo cliente registrado', 'info');
      
      return { success: true, message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.' };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error al crear cuenta' };
    }
  };

  // MEJORA 19: Función de logout
  const logout = () => {
    try {
      addLog('Logout', currentUser || 'unknown', 'Sesión cerrada', 'info');
      
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserData');
      localStorage.removeItem('currentRole');
      
      setCurrentUser(null);
      setCurrentUserData(null);
      setCurrentRole(null);
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      return false;
    }
  };

  // MEJORA 20: Función para actualizar perfil
  const updateProfile = async (userData) => {
    try {
      const usuarios = getUsuarios();
      const userIndex = usuarios.findIndex(u => u.username === currentUser);
      
      if (userIndex === -1) {
        return { success: false, message: 'Usuario no encontrado' };
      }
      
      usuarios[userIndex] = { ...usuarios[userIndex], ...userData };
      setUsuarios(usuarios);
      
      // Actualizar sesión si es necesario
      if (userData.nombre || userData.email) {
        const updatedUserData = { ...currentUserData, ...userData };
        localStorage.setItem('currentUserData', JSON.stringify(updatedUserData));
        setCurrentUserData(updatedUserData);
      }
      
      addLog('Perfil actualizado', currentUser, JSON.stringify(userData), 'info');
      
      return { success: true, message: 'Perfil actualizado correctamente' };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return { success: false, message: 'Error al actualizar perfil' };
    }
  };

  const value = {
    currentUser,
    currentUserData,
    currentRole,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};