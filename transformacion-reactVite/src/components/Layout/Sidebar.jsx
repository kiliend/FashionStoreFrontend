import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAdmin, isVendedor } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', visible: true },
    { id: 'productos', label: 'Productos', icon: '👗', visible: true },
    { id: 'ventas', label: 'Ventas', icon: '🛍️', visible: true },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', visible: isAdmin },
    { id: 'reportes', label: 'Reportes', icon: '📈', visible: isAdmin },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚', visible: isAdmin },
    { id: 'mensajes', label: 'Mensajes', icon: '📩', visible: isAdmin },
  ];

  const visibleItems = menuItems.filter(item => item.visible);
  
  const finalItems = isVendedor 
    ? visibleItems.filter(item => item.id === 'dashboard' || item.id === 'ventas')
    : visibleItems;

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
            <p className="text-sm text-[#f5c8d7]">Panel de administración</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {finalItems.map((item) => (
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
          
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all mt-4 bg-[#e0f2fe] text-[#0369a1]">
            <span>🏠</span>
            <span>Inicio</span>
          </a>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;