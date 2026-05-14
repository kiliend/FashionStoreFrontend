// src/components/Admin/Reportes.jsx
import React, { useState, useEffect } from 'react';
import { getVentas, getProductos, getUsuarios } from '../../lib/storage';

const Reportes = () => {
  const [reporteTipo, setReporteTipo] = useState('ventas');
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setVentas(getVentas());
    setProductos(getProductos());
    setUsuarios(getUsuarios());
  };

  const generarReporteVentas = () => {
    const totalVentas = ventas.length;
    const ingresosTotales = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
    const ventasPorMes = {};
    
    ventas.forEach(v => {
      if (v.fechaISO) {
        const mes = v.fechaISO.substring(0, 7);
        ventasPorMes[mes] = (ventasPorMes[mes] || 0) + 1;
      }
    });
    
    return { totalVentas, ingresosTotales, ventasPorMes };
  };

  const generarReporteProductos = () => {
    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.estado === 'activo').length;
    const stockTotal = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
    const productosBajoStock = productos.filter(p => p.stock <= (p.stockMinimo || 5)).length;
    
    return { totalProductos, productosActivos, stockTotal, productosBajoStock };
  };

  const generarReporteUsuarios = () => {
    const totalUsuarios = usuarios.length;
    const porRol = {};
    usuarios.forEach(u => {
      porRol[u.rol] = (porRol[u.rol] || 0) + 1;
    });
    
    return { totalUsuarios, porRol };
  };

  const descargarReporte = () => {
    let datos = {};
    let nombreArchivo = '';
    
    if (reporteTipo === 'ventas') {
      datos = generarReporteVentas();
      nombreArchivo = `reporte_ventas_${new Date().toISOString().split('T')[0]}.json`;
    } else if (reporteTipo === 'productos') {
      datos = generarReporteProductos();
      nombreArchivo = `reporte_productos_${new Date().toISOString().split('T')[0]}.json`;
    } else {
      datos = generarReporteUsuarios();
      nombreArchivo = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', nombreArchivo);
    linkElement.click();
  };

  const reporteVentas = generarReporteVentas();
  const reporteProductos = generarReporteProductos();
  const reporteUsuarios = generarReporteUsuarios();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setReporteTipo('ventas')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${reporteTipo === 'ventas' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
          >
            Ventas
          </button>
          <button
            onClick={() => setReporteTipo('productos')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${reporteTipo === 'productos' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
          >
            Productos
          </button>
          <button
            onClick={() => setReporteTipo('usuarios')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${reporteTipo === 'usuarios' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
          >
            Usuarios
          </button>
        </div>
        <button onClick={descargarReporte} className="btn-primary">
          📥 Descargar Reporte
        </button>
      </div>
      
      {reporteTipo === 'ventas' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Reporte de Ventas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">Total de Ventas</p>
              <p className="text-3xl font-bold">{reporteVentas.totalVentas}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700">Ingresos Totales</p>
              <p className="text-3xl font-bold">S/ {reporteVentas.ingresosTotales.toFixed(2)}</p>
            </div>
          </div>
          
          <h4 className="font-bold mb-3">Ventas por Mes</h4>
          <div className="space-y-2">
            {Object.entries(reporteVentas.ventasPorMes).length === 0 ? (
              <p className="text-[#7a5d68]">No hay datos</p>
            ) : (
              Object.entries(reporteVentas.ventasPorMes).map(([mes, total]) => (
                <div key={mes} className="flex items-center gap-3">
                  <span className="w-32">{mes}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#d9467a] to-[#b83267] h-full rounded-full"
                      style={{ width: `${Math.min((total / Math.max(...Object.values(reporteVentas.ventasPorMes))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span>{total} ventas</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {reporteTipo === 'productos' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Reporte de Productos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700">Total Productos</p>
              <p className="text-2xl font-bold">{reporteProductos.totalProductos}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700">Productos Activos</p>
              <p className="text-2xl font-bold">{reporteProductos.productosActivos}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">Stock Total</p>
              <p className="text-2xl font-bold">{reporteProductos.stockTotal}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-700">Stock Bajo</p>
              <p className="text-2xl font-bold">{reporteProductos.productosBajoStock}</p>
            </div>
          </div>
        </div>
      )}
      
      {reporteTipo === 'usuarios' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Reporte de Usuarios</h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700">Total de Usuarios</p>
            <p className="text-3xl font-bold">{reporteUsuarios.totalUsuarios}</p>
          </div>
          
          <h4 className="font-bold mb-3">Distribución por Rol</h4>
          <div className="space-y-3">
            {Object.entries(reporteUsuarios.porRol).map(([rol, cantidad]) => (
              <div key={rol} className="flex items-center gap-3">
                <span className="w-32 capitalize">{rol.replace('_', ' ')}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#d9467a] to-[#b83267] h-full rounded-full"
                    style={{ width: `${(cantidad / reporteUsuarios.totalUsuarios) * 100}%` }}
                  ></div>
                </div>
                <span>{cantidad} usuarios ({((cantidad / reporteUsuarios.totalUsuarios) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;