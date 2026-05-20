// src/pages/Carrito.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { getCarritoLanding, setCarritoLanding, getProductos, setProductos, getVentas, setVentas, getCupones, setCupones, addLog } from '../lib/storage';
import Spinner from '../components/UI/Spinner';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [descuento, setDescuento] = useState(0);

  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

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
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
    setCarritoLanding(nuevoCarrito);
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const igv = subtotal * 0.18;
    const totalConDescuento = Math.max(0, subtotal - descuento);
    const total = totalConDescuento + igv;
    return { subtotal, igv, total, descuento };
  };

  const aplicarCupon = () => {
    const cupones = getCupones();
    const cupon = cupones.find(c => c.codigo === codigoCupon.toUpperCase());
    
    if (!cupon) {
      setMensaje('Cupón inválido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    if (cupon.usado) {
      setMensaje('Este cupón ya fue utilizado');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    if (new Date(cupon.validoHasta) < new Date()) {
      setMensaje('Cupón vencido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    const { subtotal } = calcularTotales();
    if (subtotal < cupon.minCompra) {
      setMensaje(`Mínimo de compra S/ ${cupon.minCompra}`);
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    let descuentoAplicado = 0;
    if (cupon.tipo === 'porcentaje') {
      descuentoAplicado = (subtotal * cupon.descuento) / 100;
    } else {
      descuentoAplicado = cupon.descuento;
    }

    // Marcar cupón como usado
    const cuponesActualizados = cupones.map(c => 
      c.codigo === cupon.codigo ? { ...c, usado: true } : c
    );
    setCupones(cuponesActualizados);
    
    setCuponAplicado(cupon);
    setDescuento(descuentoAplicado);
    setMensaje(`Cupón aplicado! Descuento: S/ ${descuentoAplicado.toFixed(2)}`);
    setTimeout(() => setMensaje(''), 3000);
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      setMensaje('Agrega al menos un producto para finalizar la compra.');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/carrito');
      setMensaje('Debe iniciar sesión para solicitar la compra.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    setLoading(true);
    
    // Simular proceso
    setTimeout(() => {
      const productos = getProductos();

// Verificar stock
      for (const item of carrito) {
        const producto = productos.find(p => p.id === item.id);
        if (!producto || producto.stock < item.cantidad) {
          setMensaje(`Stock insuficiente para ${item.nombre}.`);
          setLoading(false);
          setTimeout(() => setMensaje(''), 3000);
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
      
      const { subtotal, igv, total, descuento: descAplicado } = calcularTotales();
      
      const nuevaVenta = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        fechaISO: new Date().toISOString(),
        cliente: currentUser,
        vendedor: currentUser,
        origen: 'ecommerce',
        items: [...carrito],
        subtotal,
        igv,
        total,
        descuento: descAplicado,
        cuponAplicado: cuponAplicado?.codigo || null,
        metodoPago: 'Solicitud online',
        estado: 'pendiente'
      };
      
      const ventas = getVentas();
      const nuevasVentas = [nuevaVenta, ...ventas];
      setVentas(nuevasVentas);
      setProductos(nuevosProductos);
      setCarritoLanding([]);
      setCarrito([]);
      
      addLog(`Venta registrada`, currentUser, `Total: S/ ${total.toFixed(2)}`);
      
      setMensaje('Solicitud de compra registrada correctamente.');
      setLoading(false);
      
      setTimeout(() => {
        setMensaje('');
        navigate('/');
      }, 2000);
    }, 1500);
  };

  const { subtotal, igv, total } = calcularTotales();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
          <p className="ml-4 text-[#7a5d68]">Procesando tu compra...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Carrito de compra</h2>
          <p className="text-[#7a5d68]">Revisa los productos seleccionados</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 bg-white rounded-2xl border border-[#f1d7e1] shadow-soft p-6">


      
          {/* Items del carrito */}
          <div className="space-y-4">
            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#7a5d68] text-lg mb-4">No hay productos agregados al carrito.</p>
                <button onClick={() => navigate('/catalogo')} className="btn-primary">
                  Explorar catálogo
                </button>
              </div>
            ) : (
              carrito.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-[#fff8fb] rounded-xl border border-[#f1d7e1]">
                  <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.nombre}</h3>
                    <p className="text-sm text-[#7a5d68]">Color: {item.color} | Talla: {item.talla}</p>
                    <p className="font-semibold">S/ {item.precio.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => actualizarCantidad(idx, item.cantidad - 1)} 
                      className="w-8 h-8 rounded-full bg-[#ffe1ec] text-[#b83267] font-bold hover:bg-[#f5c8d7] transition"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                    <button 
                      onClick={() => actualizarCantidad(idx, item.cantidad + 1)} 
                      className="w-8 h-8 rounded-full bg-[#ffe1ec] text-[#b83267] font-bold hover:bg-[#f5c8d7] transition"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => eliminarItem(idx)} 
                      className="bg-red-100 text-red-700 font-bold py-2 px-3 rounded-xl transition-all hover:bg-red-200 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="font-bold text-[#b83267]">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Resumen */}
          <div className="lg:border-l lg:border-[#f1d7e1] lg:pl-6">
            <div className="space-y-3">
              <p className="flex justify-between">
                Subtotal: <strong>S/ {subtotal.toFixed(2)}</strong>
              </p>
              <p className="flex justify-between">
                IGV (18%): <strong>S/ {igv.toFixed(2)}</strong>
              </p>
              {descuento > 0 && (
                <p className="flex justify-between text-green-600">
                  Descuento: <strong>- S/ {descuento.toFixed(2)}</strong>
                </p>
              )}

              <div className="mt-4">
                <label className="block font-semibold mb-2">¿Tienes un cupón?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value)}
                    className="input-field flex-1 uppercase"
                  />
                  <button onClick={aplicarCupon} className="btn-secondary">
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
                disabled={carrito.length === 0}
                className={`w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90 mt-4 ${carrito.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Finalizar compra
              </button>
              
              {mensaje && (
                <p className={`text-center mt-3 font-semibold ${mensaje.includes('Debe') || mensaje.includes('inválido') || mensaje.includes('insuficiente') ? 'text-red-600' : 'text-green-600'}`}>
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

