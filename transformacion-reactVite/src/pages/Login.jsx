// src/pages/Login.jsx
// MEJORA 46-50: Login mejorado con seguridadimport React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    registerUsername: '',
    registerPassword: '',
    email: ''
  });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { login, register, isAuthenticated, currentRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'vendedor') {
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

  // MEJORA 46: Validación de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    
    if (!username || !password) {
      setMensaje({ text: 'Complete usuario y contraseña.', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = login(username, password);
      
      if (result.success) {
        setMensaje({ text: 'Iniciando sesión...', type: 'success' });
      } else {
        setMensaje({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMensaje({ text: 'Error al iniciar sesión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nombre, registerUsername, registerPassword, email } = formData;
    
    // MEJORA 47: Validaciones mejoradas
    if (!nombre || !registerUsername || !registerPassword) {
      setMensaje({ text: 'Complete todos los campos obligatorios.', type: 'error' });
      return;
    }
    
    if (nombre.length < 3) {
      setMensaje({ text: 'El nombre debe tener al menos 3 caracteres.', type: 'error' });
      return;
    }
    
    if (registerUsername.length < 3) {
      setMensaje({ text: 'El usuario debe tener al menos 3 caracteres.', type: 'error' });
      return;
    }
    
    if (registerPassword.length < 6) {
      setMensaje({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }
    
    if (email && !validateEmail(email)) {
      setMensaje({ text: 'Ingrese un correo electrónico válido.', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = register(nombre, registerUsername, registerPassword, email);
      
      if (result.success) {
        setMensaje({ text: result.message, type: 'success' });
        setFormData({
          username: '',
          password: '',
          nombre: '',
          registerUsername: '',
          registerPassword: '',
          email: ''
        });
        setIsLogin(true);
      } else {
        setMensaje({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMensaje({ text: 'Error al crear cuenta', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // MEJORA 48: Credenciales de demo
  const fillDemoCredentials = () => {
    setFormData(prev => ({ ...prev, username: 'admin', password: '123456' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#fff0f5] to-[#ffe4ec]">
      <div className="w-full max-w-md bg-white/94 border border-[#f1d7e1] rounded-2xl p-8 shadow-soft">
        <div className="text-center mb-6">
          <Link to="/">
            <div className="w-18 h-18 rounded-full mx-auto mb-3 bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white flex items-center justify-center font-extrabold text-2xl cursor-pointer">
              FS
            </div>
          </Link>
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
                disabled={loading}
              />
            </div>
            <div className="mb-5">
              <label className="block font-semibold mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all pr-10"
                  placeholder="Ingrese su contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            
            {/* MEJORA 49: Botón demo */}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full mt-3 text-sm text-[#b83267] hover:underline"
            >
              Usar credenciales de demo (admin/123456)
            </button>
            
            <div className="mt-4 text-xs text-[#7a5d68] text-center space-y-1">
              <p>👑 Admin: <b>admin</b> / <b>123456</b></p>
              <p>💼 Vendedor: Contacta al administrador</p>
              <p>📦 Almacenero: Contacta al administrador</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Nombre completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ej. Ana Torres"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ej. ana@email.com"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Usuario *</label>
              <input
                type="text"
                name="registerUsername"
                value={formData.registerUsername}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all"
                placeholder="Ej. anatorres"
                disabled={loading}
              />
            </div>
            <div className="mb-5">
              <label className="block font-semibold mb-2">Contraseña *</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="registerPassword"
                  value={formData.registerPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a] transition-all pr-10"
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}
        
        {mensaje.text && (
          <p className={`mt-4 text-center font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {mensaje.text}
          </p>
        )}
        
        {/* MEJORA 50: Link para volver al inicio */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-[#7a5d68] hover:text-[#b83267]">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;