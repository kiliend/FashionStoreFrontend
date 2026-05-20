// src/pages/Carrito.jsx
// MEJORA 21-30: Carrito completamente corregido

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCarritoLanding, 
  setCarritoLanding, 
  getProductos, 
  setProductos, 
  getVentas, 
  setVentas,
  getCupones,
  setCupones,
  addLog 
} from '../lib/storage';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [procesando, setProcesando] = useState(false);

  const { isAuthenticated, currentUser, currentUserData } = useAuth();
  const navigate = useNavigate();

  // MEJORA 21: useEffect con carga de datos
  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = () => {
    const carritoData = getCarritoLanding();
    setCarrito(carritoData);
  };

  const eliminarItem = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    setCarritoLanding(nuevoCarrito);
    addLog('Producto eliminado del carrito', currentUser || 'cliente', `Item ${index}`, 'info');
    mostrarMensajeTemporal('Producto eliminado', 'success');
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const producto = carrito[index];
    const productosDB = getProductos();
    const productoOriginal = productosDB.find(p => p.id === producto.id);
    
    // MEJORA 22: Validación de stock
    if (nuevaCantidad > (productoOriginal?.stock || 0)) {
      mostrarMensajeTemporal(`Stock máximo disponible: ${productoOriginal?.stock || 0}`, 'error');
      return;
    }
    
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
    setCarritoLanding(nuevoCarrito);
  };

  // MEJORA 23: Función para mostrar mensajes temporales
  const mostrarMensajeTemporal = (texto, tipo) => {
    setMensaje(texto);
    setMensajeTipo(tipo);
    setTimeout(() => {
      setMensaje('');
      setMensajeTipo('');
    }, 3000);
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const igv = subtotal * 0.18;
    const totalConDescuento = Math.max(0, subtotal - descuento);
    const total = totalConDescuento + igv;
    return { subtotal, igv, total, descuento };
  };

  // MEJORA 24: Función para aplicar cupón mejorada
  const aplicarCupon = () => {
    if (!codigoCupon.trim()) {
      mostrarMensajeTemporal('Ingrese un código de cupón', 'error');
      return;
    }
    
    const cupones = getCupones();
    const cupon = cupones.find(c => c.codigo === codigoCupon.toUpperCase() && !c.usado);
    const { subtotal } = calcularTotales();
    
    if (!cupon) {
      mostrarMensajeTemporal('Cupón inválido o ya usado', 'error');
      return;
    }
    
    if (new Date(cupon.validoHasta) < new Date()) {
      mostrarMensajeTemporal('Cupón vencido', 'error');
      return;
    }
    
    if (subtotal < cupon.minCompra) {
      mostrarMensajeTemporal(`Mínimo de compra S/ ${cupon.minCompra.toFixed(2)}`, 'error');
      return;
    }
    
    let descuentoAplicado = 0;
    if (cupon.tipo === 'porcentaje') {
      descuentoAplicado = (subtotal * cupon.descuento) / 100;
    } else {
      descuentoAplicado = cupon.descuento;
    }
    
    // MEJORA 25: Límite máximo de descuento
    descuentoAplicado = Math.min(descuentoAplicado, subtotal * 0.5);
    
    setCuponAplicado(cupon);
    setDescuento(descuentoAplicado);
    
    // Marcar cupón como usado
    const cuponesActualizados = cupones.map(c => 
      c.codigo === cupon.codigo ? { ...c, usado: true, usadoPor: currentUser, fechaUso: new Date().toISOString() } : c
    );
    setCupones(cuponesActualizados);
    
    mostrarMensajeTemporal(`Cupón aplicado! Descuento: S/ ${descuentoAplicado.toFixed(2)}`, 'success');
  };

  // MEJORA 26: Función de finalizar compra mejorada
  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      mostrarMensajeTemporal('Agrega al menos un producto para finalizar la compra.', 'error');
      return;
    }
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/carrito');
      mostrarMensajeTemporal('Debe iniciar sesión para continuar', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    setProcesando(true);
    
    try {
      const productos = getProductos();
      
      // Verificar stock
      for (const item of carrito) {
        const producto = productos.find(p => p.id === item.id);
        if (!producto) {
          mostrarMensajeTemporal(`Producto ${item.nombre} no encontrado`, 'error');
          setProcesando(false);
          return;
        }
        if (producto.stock < item.cantidad) {
          mostrarMensajeTemporal(`Stock insuficiente para ${item.nombre}. Disponible: ${producto.stock}`, 'error');
          setProcesando(false);
          return;
        }
      }
      
      // Actualizar stock
      const nuevosProductos = productos.map(p => {
        const item = carrito.find(i => i.id === p.id);
        if (item) {
          return { ...p, stock: p.stock - item.cantidad };
        }
        return p;
      });
      
      const { subtotal, igv, total, descuento: descuentoAplicado } = calcularTotales();
      
      // MEJORA 27: Generar número de orden
      const numeroOrden = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const nuevaVenta = {
        id: Date.now(),
        numeroOrden,
        fecha: new Date().toLocaleString(),
        fechaISO: new Date().toISOString(),
        cliente: currentUser,
        clienteNombre: currentUserData?.nombre || currentUser,
        vendedor: currentUser,
        origen: 'ecommerce',
        items: [...carrito],
        subtotal,
        igv,
        descuento: descuentoAplicado,
        cuponAplicado: cuponAplicado?.codigo || null,
        total,
        metodoPago: 'Solicitud online',
        estado: 'pendiente',
        estadoPago: 'pendiente'
      };
      
      const ventas = getVentas();
      const nuevasVentas = [nuevaVenta, ...ventas];
      setVentas(nuevasVentas);
      setProductos(nuevosProductos);
      setCarritoLanding([]);
      setCarrito([]);
      setCuponAplicado(null);
      setDescuento(0);
      
      addLog('Compra realizada', currentUser, `Orden: ${numeroOrden} - Total: S/ ${total.toFixed(2)}`, 'info');
      
      mostrarMensajeTemporal(`¡Compra exitosa! Orden: ${numeroOrden}`, 'success');
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      mostrarMensajeTemporal('Error al procesar la compra', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const { subtotal, igv, total } = calcularTotales();

  // MEJORA 28: Función para limpiar carrito
  const limpiarCarrito = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCarrito([]);
      setCarritoLanding([]);
      setCuponAplicado(null);
      setDescuento(0);
      mostrarMensajeTemporal('Carrito vaciado', 'success');
      addLog('Carrito vaciado', currentUser || 'cliente', '', 'info');
    }
  };

  // MEJORA 29: Calcular resumen del carrito
  const getResumenCarrito = () => ({
    totalItems: carrito.reduce((acc, item) => acc + item.cantidad, 0),
    totalProductos: carrito.length,
    ahorro: descuento
  });

  const resumen = getResumenCarrito();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Carrito de compra</h2>
          <p className="text-[#7a5d68]">Revisa los productos seleccionados</p>
          {resumen.totalItems > 0 && (
            <p className="text-sm text-[#7a5d68] mt-2">
              {resumen.totalItems} productos ({resumen.totalProductos} ítems)
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 bg-white rounded-2xl border border-[#f1d7e1] shadow-soft p-6">
          {/* Items del carrito */}
          <div className="space-y-4">
            {carrito.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#7a5d68] mb-4">No hay productos agregados al carrito.</p>
                <button onClick={() => navigate('/catalogo')} className="btn-primary">
                  Explorar catálogo
                </button>
              </div>
            ) : (
              <>
                {/* MEJORA 30: Botón limpiar carrito */}
                <div className="flex justify-end mb-2">
                  <button onClick={limpiarCarrito} className="text-red-600 text-sm hover:underline">
                    Vaciar carrito
                  </button>
                </div>
                {carrito.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                    <div className="flex-1">
                      <h3 className="font-bold">{item.nombre}</h3>
                      <p className="text-sm text-[#7a5d68]">Color: {item.color} | Talla: {item.talla}</p>
                      <p className="font-semibold">S/ {item.precio.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => actualizarCantidad(idx, item.cantidad - 1)} 
                        className="w-8 h-8 rounded-full bg-[#ffe1ec] text-[#b83267] font-bold hover:bg-[#f5c8d7] transition"
                        disabled={procesando}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                      <button 
                        onClick={() => actualizarCantidad(idx, item.cantidad + 1)} 
                        className="w-8 h-8 rounded-full bg-[#ffe1ec] text-[#b83267] font-bold hover:bg-[#f5c8d7] transition"
                        disabled={procesando}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => eliminarItem(idx)} 
                        className="bg-red-100 text-red-700 font-bold py-2 px-3 rounded-xl transition-all hover:bg-red-200 text-sm"
                        disabled={procesando}
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-[#b83267]">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Resumen */}
          <div className="lg:border-l lg:border-[#f1d7e1] lg:pl-6">
            <div className="space-y-3">
              <p className="flex justify-between">
                Subtotal: <strong>S/ {subtotal.toFixed(2)}</strong>
              </p>
              {descuento > 0 && (
                <p className="flex justify-between text-green-600">
                  Descuento: <strong>- S/ {descuento.toFixed(2)}</strong>
                </p>
              )}
              <p className="flex justify-between">
                IGV (18%): <strong>S/ {igv.toFixed(2)}</strong>
              </p>
     
              <div className="mt-4">
                <label className="block font-semibold mb-2">¿Tienes un cupón?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                    className="input-field flex-1"
                    disabled={procesando || cuponAplicado}
                  />
                  <button 
                    onClick={aplicarCupon} 
                    className="btn-secondary"
                    disabled={procesando || cuponAplicado}
                  >
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && (
                  <p className="text-green-600 text-sm mt-2">
                    Cupón {cuponAplicado.codigo} aplicado: -S/ {descuento.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="border-t border-[#f1d7e1] pt-3 mt-3">
                <h3 className="text-xl font-bold text-[#b83267] flex justify-between">
                  Total: <span>S/ {total.toFixed(2)}</span>
                </h3>
              </div>
              <button 
                onClick={finalizarCompra} 
                className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={carrito.length === 0 || procesando}
              >
                {procesando ? 'Procesando...' : 'Finalizar compra'}
              </button>
              {mensaje && (
                <p className={`text-center mt-3 font-semibold ${mensajeTipo === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {mensaje}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Carrito;