// src/components/Admin/Respaldos.jsx
import React, { useState, useEffect } from 'react';
import { 
  getRespaldos, setRespaldos, 
  getUsuarios, getProductos, getVentas, 
  getProveedores, getOrdenesCompra, getMensajesContacto,
  addLog 
} from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Respaldos = () => {
  const [respaldos, setRespaldos] = useState([]);
  const [creando, setCreando] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarRespaldos();
  }, []);

  const cargarRespaldos = () => {
    setRespaldos(getRespaldos());
  };

  const crearRespaldo = () => {
    setCreando(true);
    
    setTimeout(() => {
      const datos = {
        fecha: new Date().toLocaleString(),
        fechaISO: new Date().toISOString(),
        usuarios: getUsuarios(),
        productos: getProductos(),
        ventas: getVentas(),
        proveedores: getProveedores(),
        ordenesCompra: getOrdenesCompra(),
        mensajes: getMensajesContacto()
      };
      
      const nuevoRespaldo = {
        id: Date.now(),
        nombre: `Respaldo_${new Date().toISOString().replace(/[:.]/g, '-')}`,
        fecha: new Date().toLocaleString(),
        creadoPor: currentUser,
        tamaño: JSON.stringify(datos).length,
        datos: datos
      };
      
      const nuevosRespaldos = [nuevoRespaldo, ...respaldos];
      setRespaldos(nuevosRespaldos);
      setRespaldos(nuevosRespaldos);
      addLog(`Respaldo creado`, currentUser, `Nombre: ${nuevoRespaldo.nombre}`);
      setCreando(false);
    }, 1500);
  };

  const restaurarRespaldo = (respaldo) => {
    if (confirm('¿Está seguro de restaurar este respaldo? Se perderán los datos actuales.')) {
      localStorage.setItem('usuarios', JSON.stringify(respaldo.datos.usuarios));
      localStorage.setItem('productos', JSON.stringify(respaldo.datos.productos));
      localStorage.setItem('ventas', JSON.stringify(respaldo.datos.ventas));
      localStorage.setItem('proveedores', JSON.stringify(respaldo.datos.proveedores));
      localStorage.setItem('ordenesCompra', JSON.stringify(respaldo.datos.ordenesCompra));
      localStorage.setItem('mensajesContacto', JSON.stringify(respaldo.datos.mensajes));
      
      addLog(`Respaldo restaurado`, currentUser, `Respaldo: ${respaldo.nombre}`);
      alert('Respaldo restaurado correctamente. Recargando página...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const eliminarRespaldo = (id) => {
    if (confirm('¿Eliminar este respaldo?')) {
      const nuevosRespaldos = respaldos.filter(r => r.id !== id);
      setRespaldos(nuevosRespaldos);
      setRespaldos(nuevosRespaldos);
      addLog(`Respaldo eliminado`, currentUser, `ID: ${id}`);
    }
  };

  const descargarRespaldo = (respaldo) => {
    const dataStr = JSON.stringify(respaldo.datos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${respaldo.nombre}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Respaldos del Sistema</h2>
        <button 
          onClick={crearRespaldo} 
          className="btn-primary"
          disabled={creando}
        >
          {creando ? 'Creando respaldo...' : '+ Crear Respaldo'}
        </button>
      </div>
      
      <div className="card">
        <div className="mb-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            💾 Los respaldos guardan toda la información del sistema: usuarios, productos, ventas, etc.
            Recomendamos crear respaldos periódicamente.
          </p>
        </div>
        
        <div className="space-y-3">
          {respaldos.length === 0 ? (
            <p className="text-[#7a5d68] text-center py-8">No hay respaldos creados</p>
          ) : (
            respaldos.map(respaldo => (
              <div key={respaldo.id} className="border border-[#f1d7e1] rounded-xl p-4">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h4 className="font-bold text-lg">{respaldo.nombre}</h4>
                    <p className="text-sm text-[#7a5d68]">
                      Fecha: {respaldo.fecha} | Tamaño: {formatearTamaño(respaldo.tamaño)}
                    </p>
                    <p className="text-xs text-[#7a5d68]">Creado por: {respaldo.creadoPor}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => descargarRespaldo(respaldo)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl hover:bg-blue-200 transition"
                    >
                      Descargar
                    </button>
                    <button
                      onClick={() => restaurarRespaldo(respaldo)}
                      className="bg-amber-100 text-amber-700 px-3 py-1 rounded-xl hover:bg-amber-200 transition"
                    >
                      Restaurar
                    </button>
                    <button
                      onClick={() => eliminarRespaldo(respaldo.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-xl hover:bg-red-200 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Respaldos;