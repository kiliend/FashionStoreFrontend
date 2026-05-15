// src/pages/Admin.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Dashboard from '../components/Admin/Dashboard';
import Analytics from '../components/Admin/Analytics';
import Productos from '../components/Admin/Productos';
import Stock from '../components/Admin/Stock';
import Ventas from '../components/Admin/Ventas';
import Usuarios from '../components/Admin/Usuarios';
import Proveedores from '../components/Admin/Proveedores';
import OrdenesCompra from '../components/Admin/OrdenesCompra';
import Mensajes from '../components/Admin/Mensajes';
import Logs from '../components/Admin/Logs';
import Respaldos from '../components/Admin/Respaldos';
import Reportes from '../components/Admin/Reportes';



const Admin = () => {
  const { currentUser, currentUserData, logout, currentRole } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'productos': return <Productos />;
      case 'stock': return <Stock />;
      case 'ventas': return <Ventas />;

      // NUEVOS CASES
      case 'cupones': return <Cupones />;
      case 'blog': return <Blog />;
      case 'faq': return <Faq />;
      case 'newsletter': return <Newsletter />;

      case 'usuarios': return <Usuarios />;
      case 'proveedores': return <Proveedores />;
      case 'ordenesCompra': return <OrdenesCompra />;
      case 'mensajes': return <Mensajes />;
      case 'logs': return <Logs />;
      case 'respaldos': return <Respaldos />;
      case 'reportes': return <Reportes />;
      default: return <Dashboard />;
    }
  };

  const getRoleBadge = () => {
    const roles = {
      super_admin: 'bg-purple-100 text-purple-700',
      admin: 'bg-pink-100 text-pink-700',
      vendedor: 'bg-blue-100 text-blue-700',
      almacenero: 'bg-green-100 text-green-700',
      cliente: 'bg-gray-100 text-gray-700'
    };
    return roles[currentRole] || 'bg-gray-100 text-gray-700';
  };

  const getRoleName = () => {
    const roles = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      vendedor: 'Vendedor',
      almacenero: 'Almacenero',
      cliente: 'Cliente'
    };
    return roles[currentRole] || 'Usuario';
  };

  const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'A';

  return (
    <div className="flex min-h-screen">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 p-4 lg:p-6">
        <div className="bg-white/80 backdrop-blur-md border border-[#f1d7e1] rounded-2xl p-4 shadow-soft mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Panel de Control</h1>
                <p className="text-[#7a5d68] text-sm">Bienvenido, {currentUserData?.nombre || currentUser}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-[#f1d7e1]">
                <div className="w-10 h-10 rounded-full bg-[#d9467a] text-white flex items-center justify-center font-bold">
                  {userInitial}
                </div>
                <div>
                  <strong>{currentUserData?.nombre || currentUser}</strong>
                  <div className="flex items-center gap-2">
                    <small className="text-[#7a5d68] text-xs">{currentUserData?.email || 'sin email'}</small>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge()}`}>
                      {getRoleName()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button onClick={logout} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold hover:bg-red-200 transition">
                Salir
              </button>
            </div>
          </div>
        </div>
        
        {renderSection()}
      </main>
    </div>
  );
};

export default Admin;