//src\components\Admin\Mensajes.jsx
import React, { useState, useEffect } from 'react';
import { getMensajesContacto, setMensajesContacto } from '../../lib/storage';

const Mensajes = () => {
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = () => {
    setMensajes(getMensajesContacto());
  };

  const marcarLeido = (id) => {
    const nuevosMensajes = mensajes.map(m =>
      m.id === id ? { ...m, estado: 'leido' } : m
    );
    setMensajesContacto(nuevosMensajes);
    setMensajes(nuevosMensajes);
  };

  const eliminarMensaje = (id) => {
    if (confirm('¿Desea eliminar este mensaje?')) {
      const nuevosMensajes = mensajes.filter(m => m.id !== id);
      setMensajesContacto(nuevosMensajes);
      setMensajes(nuevosMensajes);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Mensajes de contacto</h2>
        <p className="text-[#7a5d68]">Solicitudes y consultas enviadas desde el formulario público</p>
      </div>
      
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Bandeja de mensajes</h3>
          <span className="tag">Contacto</span>
        </div>
        
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#fff4f8]">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Correo</th>
              <th className="p-3 text-left">Mensaje</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensajes.map((msg) => (
              <tr key={msg.id} className="border-b border-[#f1d7e1]">
                <td className="p-3 font-medium">{msg.nombre}</td>
                <td className="p-3">{msg.correo}</td>
                <td className="p-3 max-w-xs truncate">{msg.mensaje}</td>
                <td className="p-3 text-sm">{msg.fecha}</td>
                <td className="p-3">
                  <span className={msg.estado === 'nuevo' ? 'tag tag-warning' : 'tag tag-success'}>
                    {msg.estado === 'nuevo' ? 'Nuevo' : 'Leído'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {msg.estado === 'nuevo' && (
                      <button onClick={() => marcarLeido(msg.id)} className="btn-secondary text-sm py-1 px-3">
                        Leído
                      </button>
                    )}
                    <button onClick={() => eliminarMensaje(msg.id)} className="btn-danger text-sm py-1 px-3">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {mensajes.length === 0 && (
          <p className="text-center text-[#7a5d68] py-8">No hay mensajes recibidos.</p>
        )}
      </div>
    </div>
  );
};

export default Mensajes;