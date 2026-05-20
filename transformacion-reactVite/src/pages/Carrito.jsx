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


