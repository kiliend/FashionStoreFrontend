// src\components\Admin\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, getVentas } from '../../lib/storage';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVentas: 0,
    productosActivos: 0,
    productosInactivos: 0,
    stockTotal: 0,
    ultimasVentas: [],
    alertas: []
  });

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = () => {
    const productos = getProductos();
    const ventas = getVentas();
    
    const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
    const totalVentas = ventasCompletadas.reduce((acc, v) => acc + v.total, 0);
    const productosActivos = productos.filter(p => p.estado === 'activo').length;
    const productosInactivos = productos.filter(p => p.estado === 'inactivo').length;
    const stockTotal = productos.filter(p => p.estado === 'activo').reduce((acc, p) => acc + p.stock, 0);
    
    const ultimasVentas = ventas.slice(0, 5);
    
    const productosStockBajo = productos.filter(p => p.estado === 'activo' && p.stock > 0 && p.stock <= 5);
    const productosSinStock = productos.filter(p => p.estado === 'activo' && p.stock === 0);
    const alertas = [...productosStockBajo, ...productosSinStock].slice(0, 5);
    
    setStats({
      totalVentas,
      productosActivos,
      productosInactivos,
      stockTotal,
      ultimasVentas,
      alertas
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Dashboard</h2>
        <p className="text-[#7a5d68]">Resumen general y estado actual de la tienda</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Ventas acumuladas</p>
            <h3 className="text-3xl font-bold">S/ {stats.totalVentas.toFixed(2)}</h3>
          </div>
          <span className="text-4xl">💰</span>
        </div>
        
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Productos activos</p>
            <h3 className="text-3xl font-bold">{stats.productosActivos}</h3>
          </div>
          <span className="text-4xl">👕</span>
        </div>
        
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Productos inmovilizados</p>
            <h3 className="text-3xl font-bold">{stats.productosInactivos}</h3>
          </div>
          <span className="text-4xl">🔒</span>
        </div>
        
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Stock total</p>
            <h3 className="text-3xl font-bold">{stats.stockTotal}</h3>
          </div>
          <span className="text-4xl">📦</span>
        </div>
      </div>
      
      {/* Últimas Ventas y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Últimas ventas</h3>
            <span className="tag tag-success">Resumen</span>
          </div>
          {stats.ultimasVentas.length === 0 ? (
            <p className="text-[#7a5d68]">No hay ventas registradas todavía.</p>
          ) : (
            <div className="space-y-3">
              {stats.ultimasVentas.map((venta) => (
                <div key={venta.id} className="flex justify-between items-center p-3 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                  <div>
                    <h4 className="font-bold">Venta #{venta.id}</h4>
                    <p className="text-sm text-[#7a5d68]">{venta.fecha}</p>
                    <p className="text-sm">{venta.metodoPago} | {venta.estado}</p>
                  </div>
                  <strong className="text-[#b83267]">S/ {venta.total.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Alertas rápidas</h3>
            <span className="tag tag-warning">Atención</span>
          </div>
          {stats.alertas.length === 0 ? (
            <p className="text-[#7a5d68]">No hay alertas disponibles.</p>
          ) : (
            <div className="space-y-3">
              {stats.alertas.map((producto, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                  <div>
                    <h4 className="font-bold">{producto.stock === 0 ? 'Sin stock' : 'Stock bajo'}</h4>
                    <p className="text-sm">{producto.nombre} - {producto.color} - {producto.talla}</p>
                  </div>
                  <strong className={producto.stock === 0 ? 'text-red-600' : 'text-amber-600'}>
                    {producto.stock} und.
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;