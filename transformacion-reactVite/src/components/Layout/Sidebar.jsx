// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSuperAdmin, isAdmin, isVendedor, isAlmacenero } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', visible: true },
    { id: 'analytics', label: 'Analytics', icon: '📈', visible: isSuperAdmin || isAdmin },
    { id: 'productos', label: 'Productos', icon: '👗', visible: isAdmin || isVendedor || isAlmacenero },
    { id: 'stock', label: 'Gestión de Stock', icon: '📦', visible: isAdmin || isAlmacenero },
    { id: 'ventas', label: 'Ventas', icon: '🛍️', visible: isAdmin || isVendedor },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', visible: isSuperAdmin || isAdmin },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚', visible: isAdmin || isAlmacenero },
    { id: 'ordenesCompra', label: 'Órdenes de Compra', icon: '📋', visible: isAdmin || isAlmacenero },
    { id: 'mensajes', label: 'Mensajes', icon: '📩', visible: isSuperAdmin || isAdmin },
    { id: 'logs', label: 'Logs del Sistema', icon: '📜', visible: isSuperAdmin },
    { id: 'respaldos', label: 'Respaldos', icon: '💾', visible: isSuperAdmin },
    { id: 'reportes', label: 'Reportes', icon: '📊', visible: isAdmin },
  ];

  const visibleItems = menuItems.filter(item => item.visible);
  
  return (
    <>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-xl shadow-soft"
      >
        ☰
      </button>
      
      <aside className={`fixed lg:relative z-40 w-64 bg-gradient-to-b from-[#4a1930] to-[#2e1120] text-white transition-all duration-300 min-h-screen p-6 ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ff6b9a] to-[#d9467a] flex items-center justify-center font-bold text-lg">
            FS
          </div>
          <div>
            <h2 className="font-bold">FashionStore</h2>
            <p className="text-sm text-[#f5c8d7]">Sistema Integrado</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsCollapsed(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeSection === item.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all mt-4">
            <span>🏠</span>
            <span>Ir a la tienda</span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;