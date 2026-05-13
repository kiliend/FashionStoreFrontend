import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    registerUsername: '',
    registerPassword: ''
  });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const { login, register, isAuthenticated, currentRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (currentRole === 'admin' || currentRole === 'vendedor') {
        navigate('/admin');
      } else if (currentRole === 'cliente') {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      }
    }
  }, [isAuthenticated, currentRole, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    
    if (!username || !password) {
      setMensaje({ text: 'Complete usuario y contraseña.', type: 'error' });
      return;
    }
    
    const result = login(username, password);
    
    if (result.success) {
      setMensaje({ text: '', type: '' });
    } else {
      setMensaje({ text: result.message, type: 'error' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nombre, registerUsername, registerPassword } = formData;
    
    if (!nombre || !registerUsername || !registerPassword) {
      setMensaje({ text: 'Complete todos los campos.', type: 'error' });
      return;
    }
    
    if (registerPassword.length < 6) {
      setMensaje({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }
    
    const result = register(nombre, registerUsername, registerPassword);
    
    if (result.success) {
      setMensaje({ text: result.message, type: 'success' });
      setFormData({
        username: '',
        password: '',
        nombre: '',
        registerUsername: '',
        registerPassword: ''
      });
      setIsLogin(true);
    } else {
      setMensaje({ text: result.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#fff0f5] to-[#ffe4ec]">
      <div className="w-full max-w-md bg-white/94 border border-[#f1d7e1] rounded-2xl p-8 shadow-soft">
        <div className="text-center mb-6">
          <div className="w-18 h-18 rounded-full mx-auto mb-3 bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white flex items-center justify-center font-extrabold text-2xl">
            FS
          </div>
          <h1 className="text-2xl font-bold">FashionStore Pro</h1>
          <p className="text-[#7a5d68] text-sm">Sistema de ventas de ropa, calzado y accesorios</p>
        </div>
        
        <div className="flex gap-2 mb-5">
          <button 
            onClick={() => {
              setIsLogin(true);
              setMensaje({ text: '', type: '' });
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isLogin 
                ? 'bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white' 
                : 'bg-white border border-[#f1d7e1] text-[#2d1b24]'
            }`}
          >
            Acceso
          </button>
          <button 
            onClick={() => {
              setIsLogin(false);
              setMensaje({ text: '', type: '' });
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !isLogin 
                ? 'bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white' 
                : 'bg-white border border-[#f1d7e1] text-[#2d1b24]'
            }`}
          >
            Crear cuenta
          </button>
        </div>
        
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ingrese su usuario"
              />
            </div>
            <div className="mb-5">
              <label className="block font-semibold mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ingrese su contraseña"
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90">
              Ingresar
            </button>
            <div className="mt-4 text-xs text-[#7a5d68] text-center space-y-1">
              <p>Usuario admin inicial: <b>admin</b></p>
              <p>Contraseña inicial: <b>123456</b></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ej. Ana Torres"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Usuario</label>
              <input
                type="text"
                name="registerUsername"
                value={formData.registerUsername}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ej. anatorres"
              />
            </div>
            <div className="mb-5">
              <label className="block font-semibold mb-2">Contraseña</label>
              <input
                type="password"
                name="registerPassword"
                value={formData.registerPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90">
              Crear cuenta
            </button>
          </form>
        )}
        
        {mensaje.text && (
          <p className={`mt-4 text-center font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {mensaje.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;