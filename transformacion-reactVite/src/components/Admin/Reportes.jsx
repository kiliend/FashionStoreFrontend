//src\components\Admin\Reportes.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, getVentas } from '../../lib/storage';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reportes = () => {
  const [reportes, setReportes] = useState({
    ventasCompletadas: 0,
    ventasAnuladas: 0,
    totalVendido: 0,
    totalProductosVendidos: 0,
    productoTop: 'Sin datos',
    colorTop: 'Sin datos',
    tallaTop: 'Sin datos',
    pagoTop: 'Sin datos',
    alertas: []
  });

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = () => {
    const productos = getProductos();
    const ventas = getVentas();
    
    const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
    const ventasAnuladas = ventas.filter(v => v.estado === 'anulada');
    const totalVendido = ventasCompletadas.reduce((acc, v) => acc + v.total, 0);
    const totalProductosVendidos = ventasCompletadas.reduce((acc, v) => 
      acc + v.items.reduce((sum, item) => sum + item.cantidad, 0), 0);
    
    // Top producto
    const productoContador = {};
    ventasCompletadas.forEach(v => {
      v.items.forEach(item => {
        productoContador[item.nombre] = (productoContador[item.nombre] || 0) + item.cantidad;
      });
    });
    const productoTop = Object.entries(productoContador).length > 0 
      ? Object.entries(productoContador).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'Sin datos';
    
    // Top color
    const colorContador = {};
    ventasCompletadas.forEach(v => {
      v.items.forEach(item => {
        colorContador[item.color] = (colorContador[item.color] || 0) + item.cantidad;
      });
    });
    const colorTop = Object.entries(colorContador).length > 0
      ? Object.entries(colorContador).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'Sin datos';
    
    // Top talla
    const tallaContador = {};
    ventasCompletadas.forEach(v => {
      v.items.forEach(item => {
        tallaContador[item.talla] = (tallaContador[item.talla] || 0) + item.cantidad;
      });
    });
    const tallaTop = Object.entries(tallaContador).length > 0
      ? Object.entries(tallaContador).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'Sin datos';
    
    // Top método de pago
    const pagoContador = {};
    ventasCompletadas.forEach(v => {
      pagoContador[v.metodoPago] = (pagoContador[v.metodoPago] || 0) + 1;
    });
    const pagoTop = Object.entries(pagoContador).length > 0
      ? Object.entries(pagoContador).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'Sin datos';
    
    // Alertas de inventario
    const alertas = productos.filter(p => p.estado === 'activo' && p.stock <= 5);
    
    setReportes({
      ventasCompletadas: ventasCompletadas.length,
      ventasAnuladas: ventasAnuladas.length,
      totalVendido,
      totalProductosVendidos,
      productoTop,
      colorTop,
      tallaTop,
      pagoTop,
      alertas
    });
  };

  const generarDatosCompletos = () => {
    const ventas = getVentas();
    const productos = getProductos();
    const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
    
    // Ventas por producto
    const ventasPorProducto = {};
    ventasCompletadas.forEach(v => {
      v.items.forEach(item => {
        if (!ventasPorProducto[item.nombre]) {
          ventasPorProducto[item.nombre] = { cantidad: 0, total: 0 };
        }
        ventasPorProducto[item.nombre].cantidad += item.cantidad;
        ventasPorProducto[item.nombre].total += item.precio * item.cantidad;
      });
    });
    
    return {
      resumen: [
        ['Ventas completadas', reportes.ventasCompletadas],
        ['Ventas anuladas', reportes.ventasAnuladas],
        ['Total general vendido', `S/ ${reportes.totalVendido.toFixed(2)}`],
        ['Total productos vendidos', reportes.totalProductosVendidos],
        ['Producto más vendido', reportes.productoTop],
        ['Color más vendido', reportes.colorTop],
        ['Talla más vendida', reportes.tallaTop],
        ['Método de pago más usado', reportes.pagoTop]
      ],
      ventasPorProducto: Object.entries(ventasPorProducto).map(([nombre, data]) => ({
        producto: nombre,
        cantidad: data.cantidad,
        total: data.total
      })),
      productos: productos.map(p => ({
        nombre: p.nombre,
        categoria: p.categoria,
        color: p.color,
        talla: p.talla,
        stock: p.stock,
        precio: p.precio,
        estado: p.estado
      }))
    };
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    const datos = generarDatosCompletos();
    
    doc.setFontSize(16);
    doc.text('Informe General de Ventas - FashionStore', 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 22);
    
    doc.autoTable({
      startY: 30,
      head: [['Indicador', 'Valor']],
      body: datos.resumen
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Producto', 'Cantidad vendida', 'Total vendido']],
      body: datos.ventasPorProducto.map(item => [item.producto, item.cantidad, `S/ ${item.total.toFixed(2)}`])
    });
    
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Inventario de Productos', 14, 15);
    
    doc.autoTable({
      startY: 22,
      head: [['Producto', 'Categoría', 'Color', 'Talla', 'Stock', 'Precio', 'Estado']],
      body: datos.productos.map(p => [p.nombre, p.categoria, p.color, p.talla, p.stock, `S/ ${p.precio.toFixed(2)}`, p.estado])
    });
    
    doc.save('informe_fashionstore.pdf');
  };

  const descargarExcel = () => {
    const datos = generarDatosCompletos();
    const wb = XLSX.utils.book_new();
    
    // Hoja resumen
    const resumenData = [
      ['INFORME GENERAL DE VENTAS - FASHIONSTORE'],
      [`Fecha: ${new Date().toLocaleString()}`],
      [],
      ['RESUMEN GENERAL'],
      ...datos.resumen
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // Hoja ventas por producto
    const wsVentas = XLSX.utils.json_to_sheet(datos.ventasPorProducto);
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas por producto');
    
    // Hoja inventario
    const wsInventario = XLSX.utils.json_to_sheet(datos.productos);
    XLSX.utils.book_append_sheet(wb, wsInventario, 'Inventario');
    
    XLSX.writeFile(wb, 'informe_fashionstore.xlsx');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Reportes</h2>
        <p className="text-[#7a5d68]">Indicadores y análisis del negocio</p>
      </div>
      
      {/* Botones de exportación */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Exportar informes</h3>
          <span className="tag">PDF / Excel</span>
        </div>
        <div className="flex gap-3">
          <button onClick={descargarPDF} className="btn-primary">Descargar PDF</button>
          <button onClick={descargarExcel} className="btn-secondary">Descargar Excel</button>
        </div>
      </div>
      
      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="card">
          <h3 className="font-bold mb-2">Producto más vendido</h3>
          <p className="text-[#7a5d68]">{reportes.productoTop}</p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">Color más vendido</h3>
          <p className="text-[#7a5d68]">{reportes.colorTop}</p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">Talla más vendida</h3>
          <p className="text-[#7a5d68]">{reportes.tallaTop}</p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">Método de pago más usado</h3>
          <p className="text-[#7a5d68]">{reportes.pagoTop}</p>
        </div>
      </div>
      
      {/* Resumen de ventas y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Resumen de ventas</h3>
            <span className="tag">General</span>
          </div>
          
          <table>
            <tbody>
              <tr className="border-b border-[#f1d7e1]">
                <td className="py-2 font-semibold">Ventas completadas</td>
                <td className="py-2 text-right">{reportes.ventasCompletadas}</td>
              </tr>
              <tr className="border-b border-[#f1d7e1]">
                <td className="py-2 font-semibold">Ventas anuladas</td>
                <td className="py-2 text-right">{reportes.ventasAnuladas}</td>
              </tr>
              <tr className="border-b border-[#f1d7e1]">
                <td className="py-2 font-semibold">Total vendido</td>
                <td className="py-2 text-right text-[#b83267] font-bold">S/ {reportes.totalVendido.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-[#f1d7e1]">
                <td className="py-2 font-semibold">Total de productos vendidos</td>
                <td className="py-2 text-right">{reportes.totalProductosVendidos}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Alertas de inventario</h3>
            <span className="tag tag-warning">Stock</span>
          </div>
          
          {reportes.alertas.length === 0 ? (
            <p className="text-[#7a5d68] text-center py-4">No hay alertas disponibles.</p>
          ) : (
            <div className="space-y-3">
              {reportes.alertas.map((producto, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                  <div>
                    <h4 className="font-bold">{producto.stock === 0 ? 'Sin stock' : 'Stock bajo'}</h4>
                    <p className="text-sm">{producto.nombre} - {producto.color} - {producto.talla}</p>
                  </div>
                  <strong className="text-amber-600">{producto.stock} und.</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;