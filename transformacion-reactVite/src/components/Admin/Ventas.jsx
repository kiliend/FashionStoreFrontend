//src\components\Admin\Ventas.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, getVentas, setVentas, setProductos } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Ventas = () => {
  const { currentUser } = useAuth();
  const [productos, setProductosState] = useState([]);
  const [ventas, setVentasState] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ nombre: '', color: '', talla: '' });
  const [metodoPago, setMetodoPago] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [cajaDia, setCajaDia] = useState({ total: 0, cantidad: 0 });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const prods = getProductos();
    const ventasData = getVentas();
    setProductosState(prods);
    setVentasState(ventasData);
    calcularCajaDiaria(ventasData);
  };

  const calcularCajaDiaria = (ventasData) => {
    const hoy = new Date().toISOString().slice(0, 10);
    const ventasHoy = ventasData.filter(v => {
      if (!v.fechaISO) return false;
      return v.estado === 'completada' && v.fechaISO.slice(0, 10) === hoy;
    });
    const total = ventasHoy.reduce((acc, v) => acc + v.total, 0);
    setCajaDia({ total, cantidad: ventasHoy.length });
  };

  const getVariantesUnicas = () => {
    const nombres = [...new Set(productos.filter(p => p.estado === 'activo').map(p => p.nombre))];
    return nombres;
  };

  const getColoresByNombre = (nombre) => {
    return [...new Set(productos.filter(p => p.estado === 'activo' && p.nombre === nombre).map(p => p.color))];
  };

  const getTallasByNombreColor = (nombre, color) => {
    return [...new Set(productos.filter(p => p.estado === 'activo' && p.nombre === nombre && p.color === color).map(p => p.talla))];
  };

  const getProductoCompleto = (nombre, color, talla) => {
    return productos.find(p => p.estado === 'activo' && p.nombre === nombre && p.color === color && p.talla === talla);
  };

  const agregarAlCarrito = () => {
    const { nombre, color, talla } = selectedProduct;
    
    if (!nombre || !color || !talla) {
      setMensaje({ text: 'Seleccione producto, color y talla.', type: 'error' });
      return;
    }
    
    const producto = getProductoCompleto(nombre, color, talla);
    
    if (!producto || producto.stock <= 0) {
      setMensaje({ text: 'No hay stock disponible.', type: 'error' });
      return;
    }
    
    const existingItem = cart.find(item => item.id === producto.id);
    
    if (existingItem) {
      if (existingItem.cantidad < producto.stock) {
        const newCart = cart.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
        setCart(newCart);
      } else {
        setMensaje({ text: 'No puede agregar más unidades que el stock disponible.', type: 'error' });
        return;
      }
    } else {
      setCart([...cart, {
        id: producto.id,
        nombre: producto.nombre,
        color: producto.color,
        talla: producto.talla,
        precio: producto.precio,
        cantidad: 1
      }]);
    }
    
    setMensaje({ text: 'Producto agregado al carrito.', type: 'success' });
  };

  const eliminarDelCarrito = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const calcularTotales = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const confirmarVenta = () => {
    if (cart.length === 0) {
      setMensaje({ text: 'Debe agregar al menos un producto.', type: 'error' });
      return;
    }
    
    if (!metodoPago) {
      setMensaje({ text: 'Seleccione un método de pago.', type: 'error' });
      return;
    }
    
    // Verificar stock
    for (const item of cart) {
      const producto = productos.find(p => p.id === item.id);
      if (!producto || producto.stock < item.cantidad) {
        setMensaje({ text: `Stock insuficiente para ${item.nombre}.`, type: 'error' });
        return;
      }
    }
    
    // Actualizar stock
    const nuevosProductos = productos.map(p => {
      const item = cart.find(i => i.id === p.id);
      if (item) {
        return { ...p, stock: p.stock - item.cantidad };
      }
      return p;
    });
    
    const { subtotal, igv, total } = calcularTotales();
    
    const nuevaVenta = {
      id: Date.now(),
      fecha: new Date().toLocaleString(),
      fechaISO: new Date().toISOString(),
      vendedor: currentUser || 'No asignado',
      origen: 'presencial',
      items: [...cart],
      subtotal,
      igv,
      total,
      metodoPago,
      estado: 'completada'
    };
    
    const nuevasVentas = [nuevaVenta, ...ventas];
    
    setProductos(nuevosProductos);
    setVentas(nuevasVentas);
    setProductosState(nuevosProductos);
    setVentasState(nuevasVentas);
    setCart([]);
    setMetodoPago('');
    calcularCajaDiaria(nuevasVentas);
    setMensaje({ text: `Venta registrada correctamente con pago por ${metodoPago}.`, type: 'success' });
  };

  const anularVenta = (id) => {
    if (!confirm('¿Desea anular esta venta?')) return;
    
    const venta = ventas.find(v => v.id === id);
    if (!venta || venta.estado === 'anulada') return;
    
    // Revertir stock
    const nuevosProductos = productos.map(p => {
      const item = venta.items.find(i => i.id === p.id);
      if (item) {
        return { ...p, stock: p.stock + item.cantidad };
      }
      return p;
    });
    
    const nuevasVentas = ventas.map(v =>
      v.id === id ? { ...v, estado: 'anulada' } : v
    );
    
    setProductos(nuevosProductos);
    setVentas(nuevasVentas);
    setProductosState(nuevosProductos);
    setVentasState(nuevasVentas);
    calcularCajaDiaria(nuevasVentas);
    setMensaje({ text: 'Venta anulada correctamente.', type: 'success' });
  };

  const imprimirTicket = (venta) => {
    const ventana = window.open('', '_blank', 'width=400,height=600');
    let productosHTML = '';
    
    venta.items.forEach(item => {
      productosHTML += `
        <tr>
          <td>${item.nombre}</td>
          <td>${item.cantidad}</td>
          <td>S/ ${item.precio.toFixed(2)}</td>
          <td>S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
        </tr>
      `;
    });
    
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket Venta #${venta.id}</title>
          <style>
            body { font-family: Arial, sans-serif; width: 280px; margin: 0 auto; padding: 10px; font-size: 12px; }
            h2, h3, p { text-align: center; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { font-size: 11px; padding: 4px; border-bottom: 1px dashed #999; text-align: left; }
            .total { margin-top: 10px; border-top: 1px dashed #000; padding-top: 8px; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <h2>FashionStore</h2>
          <p>Ticket de venta</p>
          <p>N° ${venta.id}</p>
          <p>Fecha: ${venta.fecha}</p>
          <p>Pago: ${venta.metodoPago}</p>
          <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>P.U.</th><th>Sub.</th></tr></thead>
            <tbody>${productosHTML}</tbody>
          </table>
          <div class="total">
            <p class="right">Subtotal: S/ ${venta.subtotal.toFixed(2)}</p>
            <p class="right">IGV: S/ ${venta.igv.toFixed(2)}</p>
            <h3 class="right">Total: S/ ${venta.total.toFixed(2)}</h3>
          </div>
          <p>Gracias por su compra</p>
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  const { subtotal, igv, total } = calcularTotales();
  const variantes = getVariantesUnicas();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Módulo de Ventas</h2>
        <p className="text-[#7a5d68]">Proceso simple de venta para tienda de moda</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de productos */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Seleccionar producto para venta</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Producto</label>
              <select
                className="input-field"
                value={selectedProduct.nombre}
                onChange={(e) => setSelectedProduct({ nombre: e.target.value, color: '', talla: '' })}
              >
                <option value="">Seleccione un producto</option>
                {variantes.map(nombre => <option key={nombre}>{nombre}</option>)}
              </select>
            </div>
            
            {selectedProduct.nombre && (
              <div>
                <label className="block font-semibold mb-2">Color</label>
                <select
                  className="input-field"
                  value={selectedProduct.color}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, color: e.target.value, talla: '' })}
                >
                  <option value="">Seleccione un color</option>
                  {getColoresByNombre(selectedProduct.nombre).map(color => <option key={color}>{color}</option>)}
                </select>
              </div>
            )}
            
            {selectedProduct.color && (
              <div>
                <label className="block font-semibold mb-2">Talla</label>
                <select
                  className="input-field"
                  value={selectedProduct.talla}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, talla: e.target.value })}
                >
                  <option value="">Seleccione una talla</option>
                  {getTallasByNombreColor(selectedProduct.nombre, selectedProduct.color).map(talla => <option key={talla}>{talla}</option>)}
                </select>
              </div>
            )}
            
            {selectedProduct.talla && (
              <>
                {(() => {
                  const prod = getProductoCompleto(selectedProduct.nombre, selectedProduct.color, selectedProduct.talla);
                  return (
                    <>
                      <div>
                        <label className="block font-semibold mb-2">Precio</label>
                        <input type="text" className="input-field bg-gray-50" value={`S/ ${prod?.precio.toFixed(2) || '0.00'}`} readOnly />
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">Stock disponible</label>
                        <input type="text" className="input-field bg-gray-50" value={prod?.stock || 0} readOnly />
                      </div>
                    </>
                  );
                })()}
              </>
            )}
            
            <button onClick={agregarAlCarrito} className="btn-primary w-full">
              Agregar al carrito
            </button>
          </div>
        </div>
        
        {/* Carrito */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Carrito de ventas</h3>
            <span className="tag tag-warning">Activo</span>
          </div>
          
          <div className="space-y-3 min-h-[200px]">
            {cart.length === 0 ? (
              <p className="text-[#7a5d68] text-center py-8">No hay productos agregados.</p>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                  <div>
                    <strong>{item.nombre}</strong>
                    <p className="text-sm">Color: {item.color} | Talla: {item.talla}</p>
                    <p>Cantidad: {item.cantidad}</p>
                    <p>S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                  <button onClick={() => eliminarDelCarrito(idx)} className="btn-secondary text-sm py-1 px-3">
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-[#f1d7e1] pt-4 mt-4">
            <p>Subtotal: <strong>S/ {subtotal.toFixed(2)}</strong></p>
            <p>IGV (18%): <strong>S/ {igv.toFixed(2)}</strong></p>
            <h3 className="text-xl font-bold text-[#b83267] my-3">Total: S/ {total.toFixed(2)}</h3>
            
            <div className="mb-4">
              <label className="block font-semibold mb-2">Método de pago</label>
              <select className="input-field" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <option value="">Seleccione método de pago</option>
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Yape</option>
              </select>
            </div>
            
            <button onClick={confirmarVenta} className="btn-primary w-full">
              Confirmar venta
            </button>
          </div>
        </div>
      </div>
      
      {/* Caja del día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-6">
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Caja del día</p>
            <h3 className="text-2xl font-bold">S/ {cajaDia.total.toFixed(2)}</h3>
          </div>
          <span className="text-3xl">💵</span>
        </div>
        <div className="card flex justify-between items-center">
          <div>
            <p className="text-[#7a5d68] mb-2">Ventas del día</p>
            <h3 className="text-2xl font-bold">{cajaDia.cantidad}</h3>
          </div>
          <span className="text-3xl">🧾</span>
        </div>
      </div>
      
      {/* Historial de ventas */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Últimas ventas</h3>
          <span className="tag">Historial</span>
        </div>
        
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#fff4f8]">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Vendedor</th>
              <th className="p-3">Origen</th>
              <th className="p-3">Total</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-b border-[#f1d7e1]">
                <td className="p-3">{venta.id}</td>
                <td className="p-3">{venta.fecha}</td>
                <td className="p-3">{venta.vendedor || 'No asignado'}</td>
                <td className="p-3">{venta.origen || 'presencial'}</td>
                <td className="p-3">S/ {venta.total.toFixed(2)}</td>
                <td className="p-3">{venta.metodoPago}</td>
                <td className="p-3">
                  <span className={venta.estado === 'completada' ? 'tag tag-success' : 'tag tag-warning'}>
                    {venta.estado === 'completada' ? 'Completada' : 'Anulada'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => imprimirTicket(venta)} className="btn-secondary text-sm py-1 px-3">
                      Ticket
                    </button>
                    {venta.estado !== 'anulada' && (
                      <button onClick={() => anularVenta(venta.id)} className="btn-warning text-sm py-1 px-3">
                        Anular
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ventas.length === 0 && (
          <p className="text-center text-[#7a5d68] py-8">No hay ventas registradas.</p>
        )}
      </div>
      
      {mensaje.text && (
        <p className={`mt-4 font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {mensaje.text}
        </p>
      )}
    </div>
  );
};

export default Ventas;