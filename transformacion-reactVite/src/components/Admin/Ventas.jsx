// src/components/Admin/Ventas.jsx
import React, { useState, useEffect } from 'react';
import { getVentas, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = () => {
    setVentas(getVentas());
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: 'bg-amber-100 text-amber-700',
      pagado: 'bg-green-100 text-green-700',
      enviado: 'bg-blue-100 text-blue-700',
      entregado: 'bg-purple-100 text-purple-700',
      cancelado: 'bg-red-100 text-red-700'
    };
    return estados[estado] || 'bg-gray-100 text-gray-700';
  };

  const ventasFiltradas = ventas.filter(v => 
    v.cliente?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.vendedor?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.id?.toString().includes(filtro)
  );

  const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-[#7a5d68] text-sm">Total Ventas</p>
          <p className="text-3xl font-bold">{ventas.length}</p>
        </div>
        <div className="card">
          <p className="text-[#7a5d68] text-sm">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600">S/ {totalVentas.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-[#7a5d68] text-sm">Ticket Promedio</p>
          <p className="text-3xl font-bold text-blue-600">
            S/ {(ventas.length > 0 ? totalVentas / ventas.length : 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Filtro */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar por cliente, vendedor o ID..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-field"
        />
      </div>
      
      {/* Lista de ventas */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f1d7e1]">
              <th className="text-left py-3 px-2">ID</th>
              <th className="text-left py-3 px-2">Fecha</th>
              <th className="text-left py-3 px-2">Cliente</th>
              <th className="text-left py-3 px-2">Vendedor</th>
              <th className="text-left py-3 px-2">Total</th>
              <th className="text-left py-3 px-2">Estado</th>
              <th className="text-left py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-[#7a5d68]">
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventasFiltradas.map(venta => (
                <tr key={venta.id} className="border-b border-[#f1d7e1] hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-2 font-mono text-sm">{venta.id}</td>
                  <td className="py-3 px-2">{venta.fecha}</td>
                  <td className="py-3 px-2 font-semibold">{venta.cliente}</td>
                  <td className="py-3 px-2">{venta.vendedor}</td>
                  <td className="py-3 px-2 font-bold text-[#b83267]">S/ {venta.total?.toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <span className={`tag ${getEstadoBadge(venta.estado)}`}>
                      {venta.estado?.toUpperCase() || 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button 
                      onClick={() => setVentaSeleccionada(venta)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl hover:bg-blue-200 transition"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal Detalle Venta */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">Detalle de Venta #{ventaSeleccionada.id}</h3>
              <button onClick={() => setVentaSeleccionada(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-[#7a5d68]">Fecha</p>
                  <p className="font-semibold">{ventaSeleccionada.fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-[#7a5d68]">Cliente</p>
                  <p className="font-semibold">{ventaSeleccionada.cliente}</p>
                </div>
                <div>
                  <p className="text-sm text-[#7a5d68]">Vendedor</p>
                  <p className="font-semibold">{ventaSeleccionada.vendedor}</p>
                </div>
                <div>
                  <p className="text-sm text-[#7a5d68]">Origen</p>
                  <p className="font-semibold">{ventaSeleccionada.origen || 'E-commerce'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Productos</h4>
                <div className="space-y-2">
                  {ventaSeleccionada.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold">{item.nombre}</p>
                        <p className="text-sm text-[#7a5d68]">Color: {item.color} | Talla: {item.talla}</p>
                      </div>
                      <div className="text-right">
                        <p>{item.cantidad} x S/ {item.precio.toFixed(2)}</p>
                        <p className="font-bold">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-[#f1d7e1] pt-4">
                <div className="space-y-2">
                  <p className="flex justify-between">
                    Subtotal: <span>S/ {ventaSeleccionada.subtotal?.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between">
                    IGV (18%): <span>S/ {ventaSeleccionada.igv?.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between text-xl font-bold text-[#b83267]">
                    Total: <span>S/ {ventaSeleccionada.total?.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Estado</label>
                <select 
                  className="input-field"
                  value={ventaSeleccionada.estado}
                  onChange={(e) => {
                    const nuevasVentas = ventas.map(v => 
                      v.id === ventaSeleccionada.id ? { ...v, estado: e.target.value } : v
                    );
                    localStorage.setItem('ventas', JSON.stringify(nuevasVentas));
                    addLog(`Estado de venta actualizado`, currentUser, `Venta #${ventaSeleccionada.id} -> ${e.target.value}`);
                    cargarVentas();
                    setVentaSeleccionada({ ...ventaSeleccionada, estado: e.target.value });
                  }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;