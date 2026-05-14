// src/components/Admin/Mensajes.jsx
import React, { useState, useEffect } from 'react';
import { getMensajesContacto, setMensajesContacto, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Mensajes = () => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = () => {
    setMensajes(getMensajesContacto());
  };

  const cambiarEstado = (id, nuevoEstado) => {
    const mensajesActuales = getMensajesContacto();
    const nuevosMensajes = mensajesActuales.map(m => 
      m.id === id ? { ...m, estado: nuevoEstado } : m
    );
    setMensajesContacto(nuevosMensajes);
    addLog(`Estado de mensaje actualizado`, currentUser, `Mensaje ID: ${id} -> ${nuevoEstado}`);
    cargarMensajes();
  };

  const eliminarMensaje = (id) => {
    if (confirm('¿Eliminar este mensaje?')) {
      const mensajesActuales = getMensajesContacto();
      const nuevosMensajes = mensajesActuales.filter(m => m.id !== id);
      setMensajesContacto(nuevosMensajes);
      addLog(`Mensaje eliminado`, currentUser, `Mensaje ID: ${id}`);
      cargarMensajes();
      setMensajeSeleccionado(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      nuevo: 'bg-blue-100 text-blue-700',
      leido: 'bg-gray-100 text-gray-700',
      respondido: 'bg-green-100 text-green-700'
    };
    return estados[estado] || 'bg-gray-100 text-gray-700';
  };

  const mensajesNoLeidos = mensajes.filter(m => m.estado === 'nuevo').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mensajes de Contacto</h2>
        {mensajesNoLeidos > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {mensajesNoLeidos} no leídos
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de mensajes */}
        <div className="lg:col-span-1 card overflow-y-auto max-h-[600px]">
          {mensajes.length === 0 ? (
            <p className="text-[#7a5d68] text-center py-8">No hay mensajes</p>
          ) : (
            mensajes.map(mensaje => (
              <div 
                key={mensaje.id}
                onClick={() => setMensajeSeleccionado(mensaje)}
                className={`p-3 mb-2 rounded-xl cursor-pointer transition-all ${mensajeSeleccionado?.id === mensaje.id ? 'bg-[#ffe1ec] border border-[#d9467a]' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold">{mensaje.nombre}</span>
                  <span className={`tag text-xs ${getEstadoBadge(mensaje.estado)}`}>
                    {mensaje.estado}
                  </span>
                </div>
                <p className="text-sm text-[#7a5d68]">{mensaje.correo}</p>
                <p className="text-xs text-[#7a5d68] mt-1">{mensaje.fecha}</p>
                <p className="text-sm mt-2 line-clamp-2">{mensaje.mensaje}</p>
              </div>
            ))
          )}
        </div>
        
        {/* Detalle del mensaje */}
        <div className="lg:col-span-2 card">
          {mensajeSeleccionado ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Detalle del Mensaje</h3>
                <button onClick={() => eliminarMensaje(mensajeSeleccionado.id)} className="btn-danger">
                  Eliminar
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-[#7a5d68]">Nombre</p>
                    <p className="font-semibold">{mensajeSeleccionado.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7a5d68]">Correo</p>
                    <p className="font-semibold">{mensajeSeleccionado.correo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7a5d68]">Fecha</p>
                    <p className="font-semibold">{mensajeSeleccionado.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7a5d68]">Estado</p>
                    <select 
                      value={mensajeSeleccionado.estado}
                      onChange={(e) => cambiarEstado(mensajeSeleccionado.id, e.target.value)}
                      className="text-sm border rounded-lg px-2 py-1"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="leido">Leído</option>
                      <option value="respondido">Respondido</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-[#7a5d68] mb-2">Mensaje</p>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="whitespace-pre-wrap">{mensajeSeleccionado.mensaje}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-[#7a5d68] mb-2">Responder</p>
                  <textarea 
                    rows="4" 
                    className="input-field"
                    placeholder="Escriba su respuesta aquí..."
                  ></textarea>
                  <button className="btn-primary mt-2">
                    Enviar Respuesta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#7a5d68]">Seleccione un mensaje para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mensajes;