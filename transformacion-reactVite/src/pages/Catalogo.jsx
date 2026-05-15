//src\pages\Catalogo.jsx
import { getWishlist, setWishlist, getResenas, addLog } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getProductos, getCarritoLanding, setCarritoLanding } from '../lib/storage';

const Catalogo = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [wishlist, setWishlistState] = useState([]);

  const [productos, setProductos] = useState([]);
  const [filtros, setFiltros] = useState({ categoria: '', color: '', talla: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

    //UseEffect:
  useEffect(() => {
    if (isAuthenticated) {
      const wishlistData = getWishlist();
      setWishlistState(wishlistData.map(w => w.productoId));
    }
  }, [isAuthenticated]);


  const cargarProductos = () => {
    const productosData = getProductos();
    setProductos(productosData.filter(p => p.estado === 'activo'));
  };

  const filtrarProductos = () => {
    let filtrados = getProductos().filter(p => p.estado === 'activo');
    
    if (filtros.categoria) {
      filtrados = filtrados.filter(p => p.categoria === filtros.categoria);
    }
    if (filtros.color) {
      filtrados = filtrados.filter(p => p.color === filtros.color);
    }
    if (filtros.talla) {
      filtrados = filtrados.filter(p => p.talla === filtros.talla);
    }
    
    setProductos(filtrados);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    filtrarProductos();
  }, [filtros]);

  const agregarAlCarrito = (producto) => {
    const carrito = getCarritoLanding();
    const existente = carrito.find(item => item.id === producto.id);
    
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        color: producto.color,
        talla: producto.talla,
        precio: producto.precio,
        cantidad: 1,
        imagen: producto.imagen
      });
    }
    
    setCarritoLanding(carrito);
    alert('Producto agregado al carrito');
  };

  const coloresUnicos = [...new Set(getProductos().filter(p => p.estado === 'activo').map(p => p.color))];
  const tallasUnicas = [...new Set(getProductos().filter(p => p.estado === 'activo').map(p => p.talla))];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Catálogo</h2>
          <p className="text-[#7a5d68]">Explora nuestros productos disponibles</p>
        </div>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card">
            <label className="block font-bold mb-2">Categoría</label>
            <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="input-field">
              <option value="">Todas</option>
              <option>Ropa</option><option>Calzado</option><option>Accesorio</option>
            </select>
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2">Color</label>
            <select name="color" value={filtros.color} onChange={handleFiltroChange} className="input-field">
              <option value="">Todos</option>
              {coloresUnicos.map(color => <option key={color}>{color}</option>)}
            </select>
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2">Talla</label>
            <select name="talla" value={filtros.talla} onChange={handleFiltroChange} className="input-field">
              <option value="">Todas</option>
              {tallasUnicas.map(talla => <option key={talla}>{talla}</option>)}
            </select>
          </div>
        </div>
        
        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[#f1d7e1]">
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-64 object-cover" />
              <div className="p-5">
                <span className="inline-block bg-[#ffe1ec] text-[#b83267] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {producto.categoria}
                </span>
                <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
                <p className="text-sm text-[#7a5d68]">Color: {producto.color} | Talla: {producto.talla}</p>
                <p className="text-sm text-[#7a5d68] mb-2">Stock: {producto.stock} unidades</p>
                <p className="text-xl font-bold text-[#b83267] mb-4">S/ {producto.precio.toFixed(2)}</p>
                <button 
                  onClick={() => agregarAlCarrito(producto)} 
                  disabled={producto.stock <= 0}
                  className={`btn-primary w-full text-center ${producto.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {productos.length === 0 && (
          <p className="text-center text-[#7a5d68] py-12">No hay productos disponibles con los filtros seleccionados.</p>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default Catalogo;