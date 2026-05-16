// src/components/Admin/Cupones.jsx
import React, { useState, useEffect } from 'react';
import { getCupones, setCupones, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Cupones = () => {
  const [cupones, setCuponesState] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    codigo: '',
    descuento: '',
    tipo: 'porcentaje',
    validoHasta: '',
    minCompra: 0,
    usado: false
  });

  useEffect(() => {
    cargarCupones();
  }, []);

  const cargarCupones = () => {
    setCuponesState(getCupones());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCupon = () => {
    if (!formData.codigo || !formData.descuento || !formData.validoHasta) {
      alert('Complete los campos requeridos');
      return;
    }

    const cuponesActuales = getCupones();
    
    if (editando) {
      const nuevosCupones = cuponesActuales.map(c => 
        c.id === editando ? { ...formData, id: editando } : c
      );
      setCupones(nuevosCupones);
      addLog(`Cupón actualizado`, currentUser, `Código: ${formData.codigo}`);
      alert('Cupón actualizado correctamente');
    } else {
      const nuevoId = Math.max(...cuponesActuales.map(c => c.id), 0) + 1;
      setCupones([...cuponesActuales, { ...formData, id: nuevoId }]);
      addLog(`Cupón creado`, currentUser, `Código: ${formData.codigo}`);
      alert('Cupón agregado correctamente');
    }
    
    cargarCupones();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarCupon = (id) => {
    if (confirm('¿Está seguro de eliminar este cupón?')) {
      const cuponesActuales = getCupones();
      const cupon = cuponesActuales.find(c => c.id === id);
      const nuevosCupones = cuponesActuales.filter(c => c.id !== id);
      setCupones(nuevosCupones);
      addLog(`Cupón eliminado`, currentUser, `Código: ${cupon?.codigo}`);
      cargarCupones();
    }
  };

  const editarCupon = (cupon) => {
    setFormData(cupon);
    setEditando(cupon.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      descuento: '',
      tipo: 'porcentaje',
      validoHasta: '',
      minCompra: 0,
      usado: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cupones de Descuento</h2>
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nuevo Cupón
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cupones.map(cupon => (
          <div key={cupon.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white px-3 py-1 rounded-lg font-mono font-bold">
                {cupon.codigo}
              </div>
              <span className={`tag ${cupon.usado ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                {cupon.usado ? 'Usado' : 'Activo'}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#b83267]">
              {cupon.tipo === 'porcentaje' ? `${cupon.descuento}% OFF` : `S/ ${cupon.descuento} OFF`}
            </p>
            <p className="text-sm text-[#7a5d68] mt-2">
              Mínimo de compra: S/ {cupon.minCompra || 0}
            </p>
            <p className="text-sm text-[#7a5d68]">
              Válido hasta: {cupon.validoHasta}
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => editarCupon(cupon)} className="btn-secondary flex-1 text-sm">
                Editar
              </button>
              <button onClick={() => eliminarCupon(cupon.id)} className="btn-danger flex-1 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {cupones.length === 0 && (
        <p className="text-center text-[#7a5d68] py-8">No hay cupones registrados</p>
      )}
      
      {/* Modal Cupón */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Código *</label>
                <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="input-field uppercase" placeholder="EJ: DESCUENTO20" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Tipo de Descuento</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="fijo">Monto Fijo (S/)</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Valor del Descuento *</label>
                <input type="number" name="descuento" value={formData.descuento} onChange={handleChange} className="input-field" step="0.01" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Compra Mínima (S/)</label>
                <input type="number" name="minCompra" value={formData.minCompra} onChange={handleChange} className="input-field" step="0.01" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Fecha de Vencimiento</label>
                <input type="date" name="validoHasta" value={formData.validoHasta} onChange={handleChange} className="input-field" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarCupon} className="btn-primary flex-1">
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

export default Cupones;
