import React, { useState, useEffect } from 'react';
import { getUsuarios, setUsuarios } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Usuarios = () => {
  const { currentUser, isAdmin } = useAuth();
  const [usuarios, setUsuariosState] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', usuario: '', password: '', rol: '' });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    setUsuariosState(getUsuarios());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registrarUsuario = () => {
    const { nombre, usuario, password, rol } = formData;
    
    if (!nombre || !usuario || !password || !rol) {
      setMensaje({ text: 'Complete todos los campos.', type: 'error' });
      return;
    }
    
    if (usuarios.find(u => u.usuario === usuario)) {
      setMensaje({ text: 'El usuario ya existe.', type: 'error' });
      return;
    }
    
    const nuevosUsuarios = [...usuarios, { nombre, usuario, password, rol }];
    setUsuarios(nuevosUsuarios);
    setUsuariosState(nuevosUsuarios);
    setFormData({ nombre: '', usuario: '', password: '', rol: '' });
    setMensaje({ text: 'Usuario registrado correctamente.', type: 'success' });
    setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
  };

  const eliminarUsuario = (index) => {
    const usuarioAEliminar = usuarios[index];
    
    if (usuarioAEliminar.usuario === currentUser) {
      setMensaje({ text: 'No puede eliminar su propio usuario.', type: 'error' });
      return;
    }
    
    if (confirm(`¿Desea eliminar al usuario ${usuarioAEliminar.usuario}?`)) {
      const nuevosUsuarios = usuarios.filter((_, i) => i !== index);
      setUsuarios(nuevosUsuarios);
      setUsuariosState(nuevosUsuarios);
      setMensaje({ text: 'Usuario eliminado.', type: 'success' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Gestión de Usuarios</h2>
        <p className="text-[#7a5d68]">Crear, registrar y eliminar usuarios del sistema</p>
      </div>
      
      {isAdmin && (
        <div className="card mb-6">
          <h3 className="font-bold text-lg mb-4">Registrar nuevo usuario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej. Carlos Rojas"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Nombre de usuario</label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej. crojas"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Rol</label>
              <select name="rol" value={formData.rol} onChange={handleChange} className="input-field">
                <option value="">Seleccione</option>
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>
          </div>
          
          <button onClick={registrarUsuario} className="btn-primary mt-4">
            Guardar usuario
          </button>
        </div>
      )}
      
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Listado de usuarios</h3>
          <span className="tag">Sistema</span>
        </div>
        
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#fff4f8]">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, idx) => (
              <tr key={idx} className="border-b border-[#f1d7e1]">
                <td className="p-3">{user.nombre}</td>
                <td className="p-3">{user.usuario}</td>
                <td className="p-3">
                  <span className={`role-badge ${user.rol === 'admin' ? 'role-admin' : 'role-vendedor'}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="p-3">{user.usuario === currentUser ? 'Activo' : 'Registrado'}</td>
                <td className="p-3">
                  {isAdmin && user.usuario !== currentUser && (
                    <button onClick={() => eliminarUsuario(idx)} className="btn-danger text-sm py-1 px-3">
                      Eliminar
                    </button>
                  )}
                  {user.usuario === currentUser && (
                    <span className="text-blue-600 font-semibold">Usuario activo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {usuarios.length === 0 && (
          <p className="text-center text-[#7a5d68] py-8">No hay usuarios registrados.</p>
        )}
      </div>
      
      {mensaje.text && (
        <p className={`mt-4 font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {mensaje.text}
        </p>
      )}
    </div>
  );
};

export default Usuarios;