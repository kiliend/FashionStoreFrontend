//src\components\Admin\Proveedores.jsx
import React, { useState, useEffect } from 'react';
import { getProveedores, setProveedores, getOrdenesCompra, setOrdenesCompra, getProductos, setProductos } from '../../lib/storage';

const Proveedores = () => {
  const [proveedores, setProveedoresState] = useState([]);
  const [ordenesCompra, setOrdenesCompraState] = useState([]);
  const [ordenCompraItems, setOrdenCompraItems] = useState([]);
  const [formProveedor, setFormProveedor] = useState({ nombre: '', ruc: '', telefono: '', correo: '' });
  const [ordenForm, setOrdenForm] = useState({ proveedorId: '', producto: '', cantidad: '', costoUnitario: '' });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [indicadores, setIndicadores] = useState({ totalProveedores: 0, totalOrdenes: 0, facturasPendientes: 0, alertasStock: 0 });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const proveedoresData = getProveedores();
    const ordenesData = getOrdenesCompra();
    const productos = getProductos();
    
    setProveedoresState(proveedoresData);
    setOrdenesCompraState(ordenesData);
    
    const stockBajo = productos.filter(p => p.estado === 'activo' && p.stock <= 5).length;
    
    setIndicadores({
      totalProveedores: proveedoresData.length,
      totalOrdenes: ordenesData.length,
      facturasPendientes: ordenesData.filter(o => o.facturaEstado === 'pendiente').length,
      alertasStock: stockBajo
    });
  };

  const handleProveedorChange = (e) => {
    setFormProveedor({ ...formProveedor, [e.target.name]: e.target.value });
  };

  const handleOrdenChange = (e) => {
    setOrdenForm({ ...ordenForm, [e.target.name]: e.target.value });
  };

  const registrarProveedor = () => {
    const { nombre, ruc, telefono, correo } = formProveedor;
    
    if (!nombre || !ruc || !telefono || !correo) {
      setMensaje({ text: 'Complete todos los campos del proveedor.', type: 'error' });
      return;
    }
    
    const nuevosProveedores = [...proveedores, {
      id: Date.now(),
      nombre,
      ruc,
      telefono,
      correo,
      estado: 'activo'
    }];
    
    setProveedores(nuevosProveedores);
    setProveedoresState(nuevosProveedores);
    setFormProveedor({ nombre: '', ruc: '', telefono: '', correo: '' });
    cargarDatos();
    setMensaje({ text: 'Proveedor registrado correctamente.', type: 'success' });
    setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
  };

  const eliminarProveedor = (id) => {
    if (confirm('¿Desea eliminar este proveedor?')) {
      const nuevosProveedores = proveedores.filter(p => p.id !== id);
      setProveedores(nuevosProveedores);
      setProveedoresState(nuevosProveedores);
      cargarDatos();
      setMensaje({ text: 'Proveedor eliminado.', type: 'success' });
    }
  };

  const agregarProductoOrden = () => {
    const { producto, cantidad, costoUnitario } = ordenForm;
    
    if (!producto || !cantidad || !costoUnitario) {
      setMensaje({ text: 'Complete producto, cantidad y costo unitario.', type: 'error' });
      return;
    }
    
    if (Number(cantidad) <= 0 || Number(costoUnitario) <= 0) {
      setMensaje({ text: 'Ingrese valores válidos.', type: 'error' });
      return;
    }
    
    setOrdenCompraItems([...ordenCompraItems, {
      producto,
      cantidad: Number(cantidad),
      costoUnitario: Number(costoUnitario),
      subtotal: Number(cantidad) * Number(costoUnitario)
    }]);
    
    setOrdenForm({ ...ordenForm, producto: '', cantidad: '', costoUnitario: '' });
    setMensaje({ text: 'Producto agregado a la orden.', type: 'success' });
  };

  const eliminarProductoOrden = (index) => {
    const nuevosItems = ordenCompraItems.filter((_, i) => i !== index);
    setOrdenCompraItems(nuevosItems);
  };

  const registrarOrdenCompra = () => {
    const { proveedorId } = ordenForm;
    
    if (!proveedorId) {
      setMensaje({ text: 'Seleccione un proveedor.', type: 'error' });
      return;
    }
    
    if (ordenCompraItems.length === 0) {
      setMensaje({ text: 'Agregue al menos un producto a la orden.', type: 'error' });
      return;
    }
    
    const proveedor = proveedores.find(p => p.id === Number(proveedorId));
    const total = ordenCompraItems.reduce((acc, item) => acc + item.subtotal, 0);
    
    const nuevaOrden = {
      id: Date.now(),
      proveedorId: Number(proveedorId),
      proveedorNombre: proveedor.nombre,
      fecha: new Date().toLocaleString(),
      items: [...ordenCompraItems],
      total,
      facturaEstado: 'pendiente'
    };
    
    const nuevasOrdenes = [nuevaOrden, ...ordenesCompra];
    setOrdenesCompra(nuevasOrdenes);
    setOrdenesCompraState(nuevasOrdenes);
    setOrdenCompraItems([]);
    setOrdenForm({ ...ordenForm, proveedorId: '' });
    cargarDatos();
    setMensaje({ text: 'Orden de compra registrada correctamente.', type: 'success' });
  };

  const pagarFactura = (id) => {
    const nuevasOrdenes = ordenesCompra.map(o =>
      o.id === id ? { ...o, facturaEstado: 'pagada', fechaPago: new Date().toLocaleString() } : o
    );
    setOrdenesCompra(nuevasOrdenes);
    setOrdenesCompraState(nuevasOrdenes);
    cargarDatos();
    setMensaje({ text: 'Factura pagada correctamente.', type: 'success' });
  };

  const totalOrdenActual = ordenCompraItems.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Gestión de Proveedores</h2>
        <p className="text-[#7a5d68]">Control de proveedores, órdenes de compra y facturas</p>
      </div>
      
      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="card flex justify-between items-center">
          <div><p className="text-[#7a5d68] mb-2">Proveedores</p><h3 className="text-2xl font-bold">{indicadores.totalProveedores}</h3></div>
          <span className="text-3xl">🏢</span>
        </div>
        <div className="card flex justify-between items-center">
          <div><p className="text-[#7a5d68] mb-2">Órdenes de compra</p><h3 className="text-2xl font-bold">{indicadores.totalOrdenes}</h3></div>
          <span className="text-3xl">📦</span>
        </div>
        <div className="card flex justify-between items-center">
          <div><p className="text-[#7a5d68] mb-2">Facturas pendientes</p><h3 className="text-2xl font-bold">{indicadores.facturasPendientes}</h3></div>
          <span className="text-3xl">🧾</span>
        </div>
        <div className="card flex justify-between items-center">
          <div><p className="text-[#7a5d68] mb-2">Alertas de stock</p><h3 className="text-2xl font-bold">{indicadores.alertasStock}</h3></div>
          <span className="text-3xl">⚠️</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registrar Proveedor */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Registrar proveedor</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Razón social</label>
              <input type="text" name="nombre" value={formProveedor.nombre} onChange={handleProveedorChange} className="input-field" placeholder="Ej. Textiles Lima S.A.C." />
            </div>
            <div>
              <label className="block font-semibold mb-2">RUC</label>
              <input type="text" name="ruc" value={formProveedor.ruc} onChange={handleProveedorChange} className="input-field" placeholder="Ej. 20123456789" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Teléfono</label>
              <input type="text" name="telefono" value={formProveedor.telefono} onChange={handleProveedorChange} className="input-field" placeholder="Ej. 999 999 999" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Correo</label>
              <input type="email" name="correo" value={formProveedor.correo} onChange={handleProveedorChange} className="input-field" placeholder="proveedor@correo.com" />
            </div>
            <button onClick={registrarProveedor} className="btn-primary w-full">Guardar proveedor</button>
          </div>
        </div>
        
        {/* Registrar Orden de Compra */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Registrar orden de compra</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Proveedor</label>
              <select name="proveedorId" value={ordenForm.proveedorId} onChange={handleOrdenChange} className="input-field">
                <option value="">Seleccione proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Producto</label>
              <input type="text" name="producto" value={ordenForm.producto} onChange={handleOrdenChange} className="input-field" placeholder="Ej. Polo Oversize" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Cantidad</label>
              <input type="number" name="cantidad" value={ordenForm.cantidad} onChange={handleOrdenChange} className="input-field" placeholder="Ej. 50" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Costo unitario</label>
              <input type="number" name="costoUnitario" value={ordenForm.costoUnitario} onChange={handleOrdenChange} className="input-field" placeholder="Ej. 18.50" step="0.01" />
            </div>
            <button onClick={agregarProductoOrden} className="btn-secondary w-full">Agregar producto</button>
          </div>
        </div>
      </div>
      
      {/* Productos de la orden actual */}
      {ordenCompraItems.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold text-lg mb-4">Productos de la orden</h3>
          <div className="space-y-3">
            {ordenCompraItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                <div>
                  <strong>{item.producto}</strong>
                  <p>Cantidad: {item.cantidad} | Costo: S/ {item.costoUnitario.toFixed(2)}</p>
                  <p>Subtotal: S/ {item.subtotal.toFixed(2)}</p>
                </div>
                <button onClick={() => eliminarProductoOrden(idx)} className="btn-danger text-sm py-1 px-3">Quitar</button>
              </div>
            ))}
          </div>
          <div className="border-t border-[#f1d7e1] pt-4 mt-4">
            <h3 className="text-xl font-bold text-[#b83267]">Total orden: S/ {totalOrdenActual.toFixed(2)}</h3>
            <button onClick={registrarOrdenCompra} className="btn-primary w-full mt-4">Registrar orden de compra</button>
          </div>
        </div>
      )}
      
      {/* Tabla de proveedores */}
      <div className="card overflow-x-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Listado de proveedores</h3>
          <span className="tag">Activos</span>
        </div>
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#fff4f8]">
            <tr><th className="p-3 text-left">Razón social</th><th className="p-3 text-left">RUC</th><th className="p-3 text-left">Teléfono</th><th className="p-3 text-left">Correo</th><th className="p-3 text-left">Acción</th></tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id} className="border-b border-[#f1d7e1]">
                <td className="p-3">{p.nombre}</td><td className="p-3">{p.ruc}</td><td className="p-3">{p.telefono}</td><td className="p-3">{p.correo}</td>
                <td className="p-3"><button onClick={() => eliminarProveedor(p.id)} className="btn-danger text-sm py-1 px-3">Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {proveedores.length === 0 && <p className="text-center text-[#7a5d68] py-4">No hay proveedores registrados.</p>}
      </div>
      
      {/* Tabla de órdenes de compra */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Órdenes de compra</h3>
          <span className="tag">Compras</span>
        </div>
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#fff4f8]">
            <tr><th className="p-3">ID</th><th className="p-3">Proveedor</th><th className="p-3">Productos</th><th className="p-3">Total</th><th className="p-3">Factura</th></tr>
          </thead>
          <tbody>
            {ordenesCompra.map(o => (
              <tr key={o.id} className="border-b border-[#f1d7e1]">
                <td className="p-3">{o.id}</td><td className="p-3">{o.proveedorNombre}</td>
                <td className="p-3">{o.items.map(i => `${i.producto} (${i.cantidad})`).join(', ')}</td>
                <td className="p-3">S/ {o.total.toFixed(2)}</td>
                <td className="p-3">
                  <span className={o.facturaEstado === 'pagada' ? 'tag tag-success' : 'tag tag-warning'}>{o.facturaEstado}</span>
                  {o.facturaEstado === 'pendiente' && <button onClick={() => pagarFactura(o.id)} className="btn-primary text-sm py-1 px-3 ml-2">Pagar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ordenesCompra.length === 0 && <p className="text-center text-[#7a5d68] py-4">No hay órdenes de compra registradas.</p>}
      </div>
      
      {mensaje.text && <p className={`mt-4 font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{mensaje.text}</p>}
    </div>
  );
};

export default Proveedores;