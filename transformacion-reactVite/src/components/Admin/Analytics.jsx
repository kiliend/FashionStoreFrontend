// src/components/Admin/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { getVentas, getProductos, getUsuarios } from '../../lib/storage';

const Analytics = () => {
  const [stats, setStats] = useState({
    ventasTotales: 0,
    ingresosTotales: 0,
    productosVendidos: 0,
    clientesActivos: 0
  });
  const [ventasPorMes, setVentasPorMes] = useState({});

  useEffect(() => {
    cargarAnalytics();
  }, []);

  const cargarAnalytics = () => {
    const ventas = getVentas();
    const productos = getProductos();
    const usuarios = getUsuarios();
    
    const ingresos = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    const productosVendidos = ventas.reduce((sum, venta) => {
      return sum + (venta.items?.reduce((s, item) => s + item.cantidad, 0) || 0);
    }, 0);
    
    // Ventas por mes
    const porMes = {};
    ventas.forEach(venta => {
      if (venta.fechaISO) {
        const mes = venta.fechaISO.substring(0, 7);
        porMes[mes] = (porMes[mes] || 0) + 1;
      }
    });
    
    setStats({
      ventasTotales: ventas.length,
      ingresosTotales: ingresos,
      productosVendidos: productosVendidos,
      clientesActivos: usuarios.filter(u => u.rol === 'cliente').length
    });
    
    setVentasPorMes(porMes);
  };

  const cards = [
    { titulo: 'Ventas Totales', valor: stats.ventasTotales, icono: '🛍️', color: 'bg-blue-100 text-blue-700' },
    { titulo: 'Ingresos Totales', valor: `S/ ${stats.ingresosTotales.toFixed(2)}`, icono: '💰', color: 'bg-green-100 text-green-700' },
    { titulo: 'Productos Vendidos', valor: stats.productosVendidos, icono: '📦', color: 'bg-purple-100 text-purple-700' },
    { titulo: 'Clientes Activos', valor: stats.clientesActivos, icono: '👥', color: 'bg-pink-100 text-pink-700' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icono}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.color}`}>
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold">{card.valor}</h3>
            <p className="text-[#7a5d68] text-sm">{card.titulo}</p>
          </div>
        ))}
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Ventas por Mes</h3>
        <div className="space-y-3">
          {Object.entries(ventasPorMes).length === 0 ? (
            <p className="text-[#7a5d68]">No hay datos de ventas aún</p>
          ) : (
            Object.entries(ventasPorMes).map(([mes, total]) => (
              <div key={mes} className="flex items-center gap-3">
                <span className="w-32 text-sm font-semibold">{mes}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#d9467a] to-[#b83267] h-full rounded-full transition-all"
                    style={{ width: `${Math.min((total / Math.max(...Object.values(ventasPorMes))) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{total} ventas</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Top Productos</h3>
          <p className="text-[#7a5d68] text-sm">Próximamente: productos más vendidos</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Tasa de Conversión</h3>
          <p className="text-[#7a5d68] text-sm">Próximamente: análisis de conversión</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;