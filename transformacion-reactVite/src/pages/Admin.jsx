import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Dashboard from '../components/Admin/Dashboard';
import Productos from '../components/Admin/Productos';
import Ventas from '../components/Admin/Ventas';
import Usuarios from '../components/Admin/Usuarios';
import Reportes from '../components/Admin/Reportes';
import Proveedores from '../components/Admin/Proveedores';
import Mensajes from '../components/Admin/Mensajes';

const Admin = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'productos': return <Productos />;
      case 'ventas': return <Ventas />;
      case 'usuarios': return <Usuarios />;
      case 'reportes': return <Reportes />;
      case 'proveedores': return <Proveedores />;
      case 'mensajes': return <Mensajes />;
      default: return <Dashboard />;
    }
  };

  const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'A';
  const userRole = isAdmin ? 'Administrador' : 'Vendedor';

  return (
    <div className="flex min-h-screen">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 p-4 lg:p-6">
        <div className="bg-white/80 backdrop-blur-md border border-[#f1d7e1] rounded-2xl p-4 shadow-soft mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Tienda de Moda</h1>
                <p className="text-[#7a5d68] text-sm">Ropa, calzado y accesorios</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="px-4 py-2 rounded-xl border border-[#f1d7e1] focus:outline-none focus:border-[#d9467a]"
              />
              
              <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-[#f1d7e1]">
                <div className="w-10 h-10 rounded-full bg-[#d9467a] text-white flex items-center justify-center font-bold">
                  {userInitial}
                </div>
                <div>
                  <strong>{currentUser || 'Administrador'}</strong>
                  <small className="block text-[#7a5d68] text-xs">{userRole}</small>
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