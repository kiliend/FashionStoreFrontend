// src/components/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVentas, getProductos, getUsuarios, getProveedores, getMensajesContacto } from '../../lib/storage';

const Dashboard = () => {
  const { currentRole, currentUserData } = useAuth();
  const [stats, setStats] = useState({
    ventas: 0,
    productos: 0,
    usuarios: 0,
    proveedores: 0,
    mensajes: 0
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = () => {
    const ventas = getVentas();
    const productos = getProductos();
    const usuarios = getUsuarios();
    const proveedores = getProveedores();
    const mensajes = getMensajesContacto();
    
    setStats({
      ventas: ventas.length,
      productos: productos.length,
      usuarios: usuarios.length,
      proveedores: proveedores.length,
      mensajes: mensajes.filter(m => m.estado === 'nuevo').length
    });
    
    setVentasRecientes(ventas.slice(0, 5));
  };

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const cards = [
    { titulo: 'Ventas', valor: stats.ventas, icono: '🛍️', color: 'bg-blue-100' },
    { titulo: 'Productos', valor: stats.productos, icono: '👗', color: 'bg-purple-100' },
    { titulo: 'Usuarios', valor: stats.usuarios, icono: '👥', color: 'bg-green-100' },
    { titulo: 'Proveedores', valor: stats.proveedores, icono: '🚚', color: 'bg-amber-100' },
    { titulo: 'Mensajes Nuevos', valor: stats.mensajes, icono: '📩', color: 'bg-pink-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">{getSaludo()}, {currentUserData?.nombre || currentRole}!</h2>
        <p className="text-[#7a5d68]">Bienvenido al panel de control de FashionStore</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="card text-center">
            <span className="text-3xl">{card.icono}</span>
            <p className="text-2xl font-bold mt-2">{card.valor}</p>
            <p className="text-sm text-[#7a5d68]">{card.titulo}</p>
          </div>
        ))}
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Ventas Recientes</h3>
        {ventasRecientes.length === 0 ? (
          <p className="text-[#7a5d68] text-center py-4">No hay ventas registradas</p>
        ) : (
          <div className="space-y-2">
            {ventasRecientes.map(venta => (
              <div key={venta.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold">#{venta.id}</p>
                  <p className="text-sm text-[#7a5d68]">{venta.cliente}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#b83267]">S/ {venta.total?.toFixed(2)}</p>
                  <p className="text-xs text-[#7a5d68]">{venta.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;