// src/components/Admin/Faq.jsx
import React, { useState, useEffect } from 'react';
import { getFaq, setFaq, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    pregunta: '',
    respuesta: '',
    categoria: 'Compras'
  });

  useEffect(() => {
    cargarFaqs();
  }, []);

  const cargarFaqs = () => {
    setFaqs(getFaq());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarFaq = () => {
    if (!formData.pregunta || !formData.respuesta) {
      alert('Complete los campos requeridos');
      return;
    }

    const faqsActuales = getFaq();
    
    if (editando) {
      const nuevosFaqs = faqsActuales.map(f => 
        f.id === editando ? { ...formData, id: editando } : f
      );
      setFaq(nuevosFaqs);
      addLog(`FAQ actualizada`, currentUser, `Pregunta: ${formData.pregunta}`);
      alert('FAQ actualizada correctamente');
    } else {
      const nuevoId = Math.max(...faqsActuales.map(f => f.id), 0) + 1;
      setFaq([...faqsActuales, { ...formData, id: nuevoId }]);
      addLog(`FAQ creada`, currentUser, `Pregunta: ${formData.pregunta}`);
      alert('FAQ agregada correctamente');
    }
    
    cargarFaqs();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarFaq = (id) => {
    if (confirm('¿Está seguro de eliminar esta FAQ?')) {
      const faqsActuales = getFaq();
      const faq = faqsActuales.find(f => f.id === id);
      const nuevosFaqs = faqsActuales.filter(f => f.id !== id);
      setFaq(nuevosFaqs);
      addLog(`FAQ eliminada`, currentUser, `Pregunta: ${faq?.pregunta}`);
      cargarFaqs();
    }
  };

  const editarFaq = (faq) => {
    setFormData(faq);
    setEditando(faq.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      pregunta: '',
      respuesta: '',
      categoria: 'Compras'
    });
  };

  const categorias = {
    Compras: 'bg-blue-100 text-blue-700',
    Envíos: 'bg-green-100 text-green-700',
    Devoluciones: 'bg-amber-100 text-amber-700',
    Pagos: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preguntas Frecuentes (FAQ)</h2>
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nueva FAQ
        </button>
      </div>
      
      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`tag ${categorias[faq.categoria] || 'bg-gray-100 text-gray-700'}`}>
                    {faq.categoria}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{faq.pregunta}</h3>
                <p className="text-[#7a5d68] mt-2">{faq.respuesta}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => editarFaq(faq)} className="btn-secondary text-sm px-3 py-1">
                  Editar
                </button>
                <button onClick={() => eliminarFaq(faq.id)} className="btn-danger text-sm px-3 py-1">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {faqs.length === 0 && (
        <p className="text-center text-[#7a5d68] py-8">No hay preguntas frecuentes</p>
      )}
      
      {/* Modal FAQ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar FAQ' : 'Nueva FAQ'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="input-field">
                  <option>Compras</option>
                  <option>Envíos</option>
                  <option>Devoluciones</option>
                  <option>Pagos</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Pregunta *</label>
                <input type="text" name="pregunta" value={formData.pregunta} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Respuesta *</label>
                <textarea name="respuesta" value={formData.respuesta} onChange={handleChange} rows="4" className="input-field" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarFaq} className="btn-primary flex-1">
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

export default Faq;
