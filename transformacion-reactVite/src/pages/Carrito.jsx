import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { getCarritoLanding, setCarritoLanding, getProductos, setProductos, getVentas, setVentas } from '../lib/storage';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');

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
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      setMensaje('Agrega al menos un producto para finalizar la compra.');
      return;
    }
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/carrito');
      setMensaje('Debe iniciar sesión o crear una cuenta para solicitar la compra.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    const productos = getProductos();
    
    // Verificar stock
    for (const item of carrito) {
      const producto = productos.find(p => p.id === item.id);
      if (!producto || producto.stock < item.cantidad) {
        setMensaje(`Stock insuficiente para ${item.nombre}.`);
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
    
    const { subtotal, igv, total } = calcularTotales();
    
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
      metodoPago: 'Solicitud online',
      estado: 'pendiente'
    };
    
    const ventas = getVentas();
    const nuevasVentas = [nuevaVenta, ...ventas];
    setVentas(nuevasVentas);
    setProductos(nuevosProductos);
    setCarritoLanding([]);
    setCarrito([]);
    setMensaje('Solicitud de compra registrada correctamente.');
    
    setTimeout(() => {
      setMensaje('');
      navigate('/');
    }, 2000);
  };

  const { subtotal, igv, total } = calcularTotales();
  
  // Agregar función para aplicar cupón:
  const aplicarCupon = () => {
    const cupones = getCupones();
    const cupon = cupones.find(c => c.codigo === codigoCupon.toUpperCase() && !c.usado);
    
    if (!cupon) {
      alert('Cupón inválido o ya usado');
      return;
    }
    
    if (new Date(cupon.validoHasta) < new Date()) {
      alert('Cupón vencido');
      return;
    }
    
    if (subtotal < cupon.minCompra) {
      alert(`Mínimo de compra S/ ${cupon.minCompra}`);
      return;
    }
    
    let descuentoAplicado = 0;
    if (cupon.tipo === 'porcentaje') {
      descuentoAplicado = (subtotal * cupon.descuento) / 100;
    } else {
      descuentoAplicado = cupon.descuento;
    }
    
    setCuponAplicado(cupon);
    setDescuento(descuentoAplicado);
    alert(`Cupón ${cupon.codigo} aplicado! Descuento: S/ ${descuentoAplicado.toFixed(2)}`);
  };




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
              <p className="text-[#7a5d68] text-center py-8">No hay productos agregados al carrito.</p>
            ) : (
              carrito.map((item, idx) => (
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
              <div className="border-t border-[#f1d7e1] pt-3 mt-3">
                <h3 className="text-xl font-bold text-[#b83267] flex justify-between">
                  Total: <span>S/ {total.toFixed(2)}</span>
                </h3>
              </div>
              <button 
                onClick={finalizarCompra} 
                className="w-full bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white font-bold py-3 px-5 rounded-xl transition-all hover:opacity-90 mt-4"
              >
                Finalizar compra
              </button>
              {mensaje && (
                <p className={`text-center mt-3 font-semibold ${mensaje.includes('Debe') ? 'text-red-600' : 'text-green-600'}`}>
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