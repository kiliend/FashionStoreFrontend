// src/components/Admin/Newsletter.jsx
import React, { useState, useEffect } from 'react';
import { getSuscripciones, setSuscripciones, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Newsletter = () => {
  const [suscripciones, setSuscripcionesState] = useState([]);
  const [email, setEmail] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = () => {
    setSuscripcionesState(getSuscripciones());
  };

  const agregarSuscripcion = () => {
    if (!email) {
      alert('Ingrese un email');
      return;
    }
    
    if (suscripciones.find(s => s.email === email)) {
      alert('Este email ya está suscrito');
      return;
    }
    
    const nuevaSuscripcion = {
      id: Date.now(),
      email,
      fecha: new Date().toLocaleString(),
      activo: true
    };
    
    const nuevasSuscripciones = [nuevaSuscripcion, ...suscripciones];
    setSuscripciones(nuevasSuscripciones);
    addLog(`Nuevo suscriptor`, currentUser, `Email: ${email}`);
    setEmail('');
    alert('Suscriptor agregado correctamente');
    cargarSuscripciones();
  };

  const eliminarSuscripcion = (id) => {
    if (confirm('¿Eliminar este suscriptor?')) {
      const nuevasSuscripciones = suscripciones.filter(s => s.id !== id);
      setSuscripciones(nuevasSuscripciones);
      addLog(`Suscriptor eliminado`, currentUser, `ID: ${id}`);
      cargarSuscripciones();
    }
  };

  const enviarNewsletter = () => {
    if (suscripciones.length === 0) {
      alert('No hay suscriptores para enviar');
      return;
    }
    
    const asunto = prompt('Asunto del newsletter:');
    if (!asunto) return;
    
    const mensaje = prompt('Mensaje del newsletter:');
    if (!mensaje) return;
    
    alert(`Newsletter enviado a ${suscripciones.length} suscriptores`);
    addLog(`Newsletter enviado`, currentUser, `Asunto: ${asunto}, Suscriptores: ${suscripciones.length}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Suscriptores Newsletter</h2>
        <button onClick={enviarNewsletter} className="btn-primary">
          📧 Enviar Newsletter
        </button>
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Agregar Nuevo Suscriptor</h3>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={agregarSuscripcion} className="btn-primary">
            Suscribir
          </button>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Lista de Suscriptores ({suscripciones.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {suscripciones.length === 0 ? (
            <p className="text-[#7a5d68] text-center py-8">No hay suscriptores</p>
          ) : (
            suscripciones.map(suscripcion => (
              <div key={suscripcion.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold">{suscripcion.email}</p>
                  <p className="text-xs text-[#7a5d68]">Suscrito: {suscripcion.fecha}</p>
                </div>
                <button onClick={() => eliminarSuscripcion(suscripcion.id)} className="btn-danger text-sm">
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
