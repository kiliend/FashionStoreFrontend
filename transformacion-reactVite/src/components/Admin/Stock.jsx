// src/components/Admin/Stock.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, setProductos, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Stock = () => {
  const [productos, setProductosState] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    const prods = getProductos();
    setProductosState(prods);
  };

  const actualizarStock = (id, nuevoStock) => {
    if (nuevoStock < 0) return;
    
    const nuevosProductos = productos.map(p => 
      p.id === id ? { ...p, stock: nuevoStock } : p
    );
    
    setProductos(nuevosProductos);
    setProductosState(nuevosProductos);
    const producto = productos.find(p => p.id === id);
    addLog(`Stock actualizado`, currentUser, `Producto: ${producto?.nombre}, Nuevo stock: ${nuevoStock}`);
    setMensaje('Stock actualizado correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const productosBajoStock = productos.filter(p => p.stock <= p.stockMinimo);

  return (
    <div className="space-y-6">
      {mensaje && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl font-semibold">
          {mensaje}
        </div>
      )}
      
      {/* Alertas de stock bajo */}
      {productosBajoStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ Alertas de Stock Bajo</h3>
          <div className="space-y-2">
            {productosBajoStock.map(p => (
              <div key={p.id} className="flex justify-between items-center">
                <span>{p.nombre} - Stock actual: {p.stock} (Mínimo: {p.stockMinimo})</span>
                <span className="text-red-600 font-bold">¡Reabastecer!</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtros */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-field"
        />
      </div>
      
      {/* Lista de productos */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f1d7e1]">
              <th className="text-left py-3 px-2">Producto</th>
              <th className="text-left py-3 px-2">Categoría</th>
              <th className="text-left py-3 px-2">Stock Actual</th>
              <th className="text-left py-3 px-2">Stock Mínimo</th>
              <th className="text-left py-3 px-2">Estado</th>
              <th className="text-left py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(producto => (
              <tr key={producto.id} className="border-b border-[#f1d7e1]">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <img src={producto.imagen} alt={producto.nombre} className="w-10 h-10 object-cover rounded-lg" />
                    <span className="font-semibold">{producto.nombre}</span>
                  </div>
                </td>
                <td className="py-3 px-2">{producto.categoria}</td>
                <td className="py-3 px-2">
                  <span className={`font-bold ${producto.stock <= producto.stockMinimo ? 'text-red-600' : 'text-green-600'}`}>
                    {producto.stock}
                  </span>
                </td>
                <td className="py-3 px-2">{producto.stockMinimo}</td>
                <td className="py-3 px-2">
                  {producto.stock <= 0 ? (
                    <span className="tag bg-red-100 text-red-700">Sin stock</span>
                  ) : producto.stock <= producto.stockMinimo ? (
                    <span className="tag bg-amber-100 text-amber-700">Stock bajo</span>
                  ) : (
                    <span className="tag bg-green-100 text-green-700">Disponible</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarStock(producto.id, producto.stock - 1)}
                      className="btn-danger px-3 py-1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => actualizarStock(producto.id, producto.stock + 1)}
                      className="btn-primary px-3 py-1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => {
                        const nuevoStock = prompt('Ingrese el nuevo stock:', producto.stock);
                        if (nuevoStock !== null && !isNaN(nuevoStock)) {
                          actualizarStock(producto.id, parseInt(nuevoStock));
                        }
                      }}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl"
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;