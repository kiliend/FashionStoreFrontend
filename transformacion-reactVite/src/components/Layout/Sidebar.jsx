// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentRole } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊', roles: ['super_admin', 'admin', 'vendedor', 'almacenero'] },
    { id: 'analytics', label: '📈 Analytics', icon: '📈', roles: ['super_admin', 'admin'] },
    { id: 'productos', label: '👗 Productos', icon: '👗', roles: ['super_admin', 'admin', 'vendedor', 'almacenero'] },
    { id: 'stock', label: '📦 Stock', icon: '📦', roles: ['super_admin', 'admin', 'almacenero'] },
    { id: 'ventas', label: '💰 Ventas', icon: '💰', roles: ['super_admin', 'admin', 'vendedor'] },
    { id: 'cupones', label: '🏷️ Cupones', icon: '🏷️', roles: ['super_admin', 'admin'] },
    { id: 'blog', label: '📝 Blog', icon: '📝', roles: ['super_admin', 'admin'] },
    { id: 'faq', label: '❓ FAQ', icon: '❓', roles: ['super_admin', 'admin'] },
    { id: 'newsletter', label: '📧 Newsletter', icon: '📧', roles: ['super_admin', 'admin'] },
    { id: 'usuarios', label: '👥 Usuarios', icon: '👥', roles: ['super_admin', 'admin'] },
    { id: 'proveedores', label: '🚚 Proveedores', icon: '🚚', roles: ['super_admin', 'admin'] },
    { id: 'ordenesCompra', label: '📋 Órdenes', icon: '📋', roles: ['super_admin', 'admin'] },
    { id: 'mensajes', label: '💬 Mensajes', icon: '💬', roles: ['super_admin', 'admin'] },
    { id: 'logs', label: '📜 Logs', icon: '📜', roles: ['super_admin', 'admin'] },
    { id: 'respaldos', label: '💾 Respaldos', icon: '💾', roles: ['super_admin', 'admin'] },
    { id: 'reportes', label: '📑 Reportes', icon: '📑', roles: ['super_admin', 'admin'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Botón menú móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-xl shadow-lg border border-[#f1d7e1]"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 lg:w-72 min-h-screen bg-white border-r border-[#f1d7e1]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 border-b border-[#f1d7e1]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white flex items-center justify-center font-bold text-xl mb-3">
            FS
          </div>
          <h2 className="text-xl font-bold">FashionStore</h2>
          <p className="text-xs text-[#7a5d68]">Panel de Control</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3
                ${activeSection === item.id
                  ? 'bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white shadow-md'
                  : 'hover:bg-[#ffe1ec] text-[#2d1b24]'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
