// src/components/Admin/OrdenesCompra.jsx
import React, { useState, useEffect } from 'react';
import { getOrdenesCompra, setOrdenesCompra, getProveedores, getProductos, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const OrdenesCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaOrden, setNuevaOrden] = useState({
    proveedorId: '',
    productos: [],
    fechaEntrega: '',
    notas: ''
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setOrdenes(getOrdenesCompra());
    setProveedores(getProveedores());
    setProductos(getProductos());
  };

  const agregarProducto = () => {
    setNuevaOrden({
      ...nuevaOrden,
      productos: [...nuevaOrden.productos, { productoId: '', cantidad: 1, precioUnitario: 0 }]
    });
  };

  const actualizarProducto = (index, campo, valor) => {
    const productosActualizados = [...nuevaOrden.productos];
    productosActualizados[index][campo] = valor;
    
    if (campo === 'productoId') {
      const producto = productos.find(p => p.id === parseInt(valor));
      if (producto) {
        productosActualizados[index].precioUnitario = producto.precio;
      }
    }
    
    setNuevaOrden({ ...nuevaOrden, productos: productosActualizados });
  };

  const eliminarProducto = (index) => {
    const productosActualizados = nuevaOrden.productos.filter((_, i) => i !== index);
    setNuevaOrden({ ...nuevaOrden, productos: productosActualizados });
  };

  const guardarOrden = () => {
    if (!nuevaOrden.proveedorId || nuevaOrden.productos.length === 0) {
      alert('Complete todos los campos');
      return;
    }
    
    const orden = {
      id: Date.now(),
      numero: `OC-${Date.now()}`,
      proveedorId: parseInt(nuevaOrden.proveedorId),
      proveedor: proveedores.find(p => p.id === parseInt(nuevaOrden.proveedorId))?.nombre,
      productos: nuevaOrden.productos.map(p => ({
        ...p,
        producto: productos.find(prod => prod.id === parseInt(p.productoId))?.nombre
      })),
      fecha: new Date().toLocaleString(),
      fechaEntrega: nuevaOrden.fechaEntrega,
      notas: nuevaOrden.notas,
      estado: 'pendiente',
      creadoPor: currentUser
    };
    
    const nuevasOrdenes = [orden, ...ordenes];
    setOrdenesCompra(nuevasOrdenes);
    addLog(`Orden de compra creada`, currentUser, `N° ${orden.numero}`);
    
    setShowModal(false);
    setNuevaOrden({ proveedorId: '', productos: [], fechaEntrega: '', notas: '' });
    cargarDatos();
  };

  const cambiarEstado = (id, nuevoEstado) => {
    const ordenesActualizadas = ordenes.map(orden => 
      orden.id === id ? { ...orden, estado: nuevoEstado } : orden
    );
    setOrdenesCompra(ordenesActualizadas);
    addLog(`Estado de orden actualizado`, currentUser, `Orden ID: ${id} -> ${nuevoEstado}`);
    cargarDatos();
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: 'bg-amber-100 text-amber-700',
      aprobada: 'bg-blue-100 text-blue-700',
      enviada: 'bg-purple-100 text-purple-700',
      recibida: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700'
    };
    return estados[estado] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Órdenes de Compra</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nueva Orden
        </button>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f1d7e1]">
              <th className="text-left py-3 px-2">N° Orden</th>
              <th className="text-left py-3 px-2">Proveedor</th>
              <th className="text-left py-3 px-2">Fecha</th>
              <th className="text-left py-3 px-2">Entrega</th>
              <th className="text-left py-3 px-2">Estado</th>
              <th className="text-left py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#7a5d68]">
                  No hay órdenes de compra registradas
                </td>
              </tr>
            ) : (
              ordenes.map(orden => (
                <tr key={orden.id} className="border-b border-[#f1d7e1]">
                  <td className="py-3 px-2 font-semibold">{orden.numero}</td>
                  <td className="py-3 px-2">{orden.proveedor}</td>
                  <td className="py-3 px-2">{orden.fecha}</td>
                  <td className="py-3 px-2">{orden.fechaEntrega || 'No especificada'}</td>
                  <td className="py-3 px-2">
                    <span className={`tag ${getEstadoBadge(orden.estado)}`}>
                      {orden.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={orden.estado}
                      onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                      className="text-sm border rounded-lg px-2 py-1"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="enviada">Enviada</option>
                      <option value="recibida">Recibida</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal Nueva Orden */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-4">Nueva Orden de Compra</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Proveedor</label>
                <select
                  value={nuevaOrden.proveedorId}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, proveedorId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Fecha estimada de entrega</label>
                <input
                  type="date"
                  value={nuevaOrden.fechaEntrega}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, fechaEntrega: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Productos</label>
                {nuevaOrden.productos.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      value={item.productoId}
                      onChange={(e) => actualizarProducto(idx, 'productoId', e.target.value)}
                      className="flex-1 input-field"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={item.cantidad}
                      onChange={(e) => actualizarProducto(idx, 'cantidad', parseInt(e.target.value))}
                      className="w-24 input-field"
                    />
                    <button
                      onClick={() => eliminarProducto(idx)}
                      className="btn-danger px-3"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={agregarProducto} className="btn-secondary text-sm">
                  + Agregar producto
                </button>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Notas</label>
                <textarea
                  value={nuevaOrden.notas}
                  onChange={(e) => setNuevaOrden({ ...nuevaOrden, notas: e.target.value })}
                  rows="3"
                  className="input-field"
                  placeholder="Notas adicionales..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={guardarOrden} className="btn-primary flex-1">
                  Guardar Orden
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesCompra;