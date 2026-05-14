// src/components/Admin/Logs.jsx
import React, { useState, useEffect } from 'react';
import { getLogsSistema } from '../../lib/storage';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = () => {
    setLogs(getLogsSistema());
  };

  const logsFiltrados = logs.filter(log => 
    log.accion.toLowerCase().includes(filtro.toLowerCase()) ||
    log.usuario.toLowerCase().includes(filtro.toLowerCase()) ||
    (log.detalles && log.detalles.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Logs del Sistema</h3>
        <input
          type="text"
          placeholder="Buscar en logs..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-field mb-4"
        />
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logsFiltrados.length === 0 ? (
            <p className="text-[#7a5d68] text-center py-8">No hay logs registrados</p>
          ) : (
            logsFiltrados.map(log => (
              <div key={log.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-[#b83267]">{log.accion}</span>
                  <span className="text-xs text-[#7a5d68]">{log.fecha}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Usuario:</span> {log.usuario}
                </div>
                {log.detalles && (
                  <div className="text-sm text-[#7a5d68] mt-1">
                    {log.detalles}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;