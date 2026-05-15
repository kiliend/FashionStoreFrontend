// src/components/Admin/Proveedores.jsx
import React, { useState, useEffect } from 'react';
import { getProveedores, setProveedores, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Proveedores = () => {
  const [proveedores, setProveedoresState] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = () => {
    setProveedoresState(getProveedores());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarProveedor = () => {
    if (!formData.nombre || !formData.contacto) {
      alert('Complete los campos requeridos');
      return;
    }

    const proveedoresActuales = getProveedores();
    
    if (editando) {
      const nuevosProveedores = proveedoresActuales.map(p => 
        p.id === editando ? { ...formData, id: editando } : p
      );
      setProveedores(nuevosProveedores);
      addLog(`Proveedor actualizado`, currentUser, `Proveedor: ${formData.nombre}`);
      alert('Proveedor actualizado correctamente');
    } else {
      const nuevoId = Math.max(...proveedoresActuales.map(p => p.id), 0) + 1;
      setProveedores([...proveedoresActuales, { ...formData, id: nuevoId }]);
      addLog(`Proveedor creado`, currentUser, `Proveedor: ${formData.nombre}`);
      alert('Proveedor agregado correctamente');
    }
    
    cargarProveedores();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarProveedor = (id) => {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      const proveedoresActuales = getProveedores();
      const proveedor = proveedoresActuales.find(p => p.id === id);
      const nuevosProveedores = proveedoresActuales.filter(p => p.id !== id);
      setProveedores(nuevosProveedores);
      addLog(`Proveedor eliminado`, currentUser, `Proveedor: ${proveedor?.nombre}`);
      cargarProveedores();
    }
  };

  const editarProveedor = (proveedor) => {
    setFormData(proveedor);
    setEditando(proveedor.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nuevo Proveedor
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proveedores.map(proveedor => (
          <div key={proveedor.id} className="card">
            <h3 className="font-bold text-lg mb-2">{proveedor.nombre}</h3>
            <p className="text-sm text-[#7a5d68]">Contacto: {proveedor.contacto}</p>
            <p className="text-sm text-[#7a5d68]">Teléfono: {proveedor.telefono || '-'}</p>
            <p className="text-sm text-[#7a5d68]">Email: {proveedor.email || '-'}</p>
            <p className="text-sm text-[#7a5d68]">Dirección: {proveedor.direccion || '-'}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => editarProveedor(proveedor)} className="btn-secondary flex-1 text-sm">
                Editar
              </button>
              <button onClick={() => eliminarProveedor(proveedor.id)} className="btn-danger flex-1 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {proveedores.length === 0 && (
        <p className="text-center text-[#7a5d68] py-8">No hay proveedores registrados</p>
      )}
      
      {/* Modal Proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nombre *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Contacto *</label>
                <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Dirección</label>
                <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows="2" className="input-field" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarProveedor} className="btn-primary flex-1">
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

export default Proveedores;