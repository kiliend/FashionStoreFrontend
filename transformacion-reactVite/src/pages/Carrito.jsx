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


