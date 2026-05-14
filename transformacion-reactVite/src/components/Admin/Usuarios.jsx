// src/components/Admin/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { getUsuarios, setUsuarios, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Usuarios = () => {
  const [usuarios, setUsuariosState] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const { currentUser, currentRole } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    password: '',
    email: '',
    telefono: '',
    rol: 'cliente'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    setUsuariosState(getUsuarios());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarUsuario = () => {
    if (!formData.nombre || !formData.usuario || !formData.password) {
      alert('Complete los campos requeridos');
      return;
    }

    const usuariosActuales = getUsuarios();
    
    if (editando) {
      // No actualizar contraseña si está vacía
      const updates = { ...formData };
      if (!updates.password) delete updates.password;
      
      const nuevosUsuarios = usuariosActuales.map(u => 
        u.usuario === editando ? { ...u, ...updates } : u
      );
      setUsuarios(nuevosUsuarios);
      addLog(`Usuario actualizado`, currentUser, `Usuario: ${formData.usuario}`);
      alert('Usuario actualizado correctamente');
    } else {
      // Verificar si ya existe
      if (usuariosActuales.find(u => u.usuario === formData.usuario)) {
        alert('El usuario ya existe');
        return;
      }
      
      setUsuarios([...usuariosActuales, formData]);
      addLog(`Usuario creado`, currentUser, `Usuario: ${formData.usuario}, Rol: ${formData.rol}`);
      alert('Usuario agregado correctamente');
    }
    
    cargarUsuarios();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarUsuario = (usuario) => {
    if (usuario === currentUser) {
      alert('No puede eliminar su propio usuario');
      return;
    }
    
    if (confirm(`¿Está seguro de eliminar al usuario "${usuario}"?`)) {
      const usuariosActuales = getUsuarios();
      const nuevosUsuarios = usuariosActuales.filter(u => u.usuario !== usuario);
      setUsuarios(nuevosUsuarios);
      addLog(`Usuario eliminado`, currentUser, `Usuario: ${usuario}`);
      cargarUsuarios();
    }
  };

  const editarUsuario = (usuario) => {
    setFormData({ ...usuario, password: '' });
    setEditando(usuario.usuario);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      usuario: '',
      password: '',
      email: '',
      telefono: '',
      rol: 'cliente'
    });
  };

  const getRoleBadge = (rol) => {
    const roles = {
      super_admin: 'bg-purple-100 text-purple-700',
      admin: 'bg-pink-100 text-pink-700',
      vendedor: 'bg-blue-100 text-blue-700',
      almacenero: 'bg-green-100 text-green-700',
      cliente: 'bg-gray-100 text-gray-700'
    };
    return roles[rol] || 'bg-gray-100 text-gray-700';
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    u.usuario.toLowerCase().includes(filtro.toLowerCase()) ||
    u.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Solo super_admin y admin pueden gestionar usuarios
  if (currentRole !== 'super_admin' && currentRole !== 'admin') {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600">No tiene permisos para ver esta sección</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-field max-w-xs"
        />
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nuevo Usuario
        </button>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f1d7e1]">
              <th className="text-left py-3 px-2">Usuario</th>
              <th className="text-left py-3 px-2">Nombre</th>
              <th className="text-left py-3 px-2">Email</th>
              <th className="text-left py-3 px-2">Teléfono</th>
              <th className="text-left py-3 px-2">Rol</th>
              <th className="text-left py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.usuario} className="border-b border-[#f1d7e1]">
                <td className="py-3 px-2 font-semibold">{usuario.usuario}</td>
                <td className="py-3 px-2">{usuario.nombre}</td>
                <td className="py-3 px-2">{usuario.email || '-'}</td>
                <td className="py-3 px-2">{usuario.telefono || '-'}</td>
                <td className="py-3 px-2">
                  <span className={`tag ${getRoleBadge(usuario.rol)}`}>
                    {usuario.rol.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <button onClick={() => editarUsuario(usuario)} className="btn-secondary text-sm px-3 py-1">
                      Editar
                    </button>
                    {usuario.usuario !== currentUser && (
                      <button onClick={() => eliminarUsuario(usuario.usuario)} className="btn-danger text-sm px-3 py-1">
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nombre completo *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Usuario *</label>
                <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} className="input-field" disabled={!!editando} />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Contraseña {editando ? '(dejar en blanco para no cambiar)' : '*'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Rol</label>
                <select name="rol" value={formData.rol} onChange={handleChange} className="input-field">
                  {currentRole === 'super_admin' && <option value="super_admin">Super Administrador</option>}
                  <option value="admin">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="almacenero">Almacenero</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarUsuario} className="btn-primary flex-1">
                {editando ? 'Actualizar' : 'Guardar'}
              </button>
              <button onClick={() => {
                setShowModal(false);
                setEditando(null);
                resetForm();
              }} className="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;