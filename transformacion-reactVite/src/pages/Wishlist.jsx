// src/pages/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getWishlist, setWishlist, getProductos, addLog } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

const Wishlist = () => {
  const [wishlist, setWishlistState] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensajeEliminacion, setMensajeEliminacion] = useState(''); // CAMBIO: Mensaje temporal
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    cargarWishlist();
  }, []);

  const cargarWishlist = () => {
    const wishlistData = getWishlist();
    const productosData = getProductos();
    setProductos(productosData);
    
    const wishlistConDetalles = wishlistData.map(item => {
      const producto = productosData.find(p => p.id === item.productoId);
      return { ...item, producto };
    }).filter(item => item.producto);
    
    setWishlistState(wishlistConDetalles);
  };

  const eliminarDeWishlist = (productoId, nombreProducto) => {
    const wishlistActual = getWishlist();
    const nuevaWishlist = wishlistActual.filter(item => item.productoId !== productoId);
    setWishlist(nuevaWishlist);
    addLog(`Producto eliminado de wishlist`, currentUser || 'cliente', `Producto ID: ${productoId}`);
    cargarWishlist();
    
    // CAMBIO: Mostrar mensaje temporal al eliminar
    setMensajeEliminacion(`"${nombreProducto}" eliminado de favoritos`);
    setTimeout(() => setMensajeEliminacion(''), 2000);
  };

  const agregarAlCarrito = (producto) => {
    const carrito = JSON.parse(localStorage.getItem('carritoLanding')) || [];
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
    
    localStorage.setItem('carritoLanding', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
    eliminarDeWishlist(producto.id, producto.nombre);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-20 px-[8%] text-center">
          <h2 className="text-3xl font-bold mb-4">Lista de Deseos</h2>
          <p className="text-[#7a5d68] mb-4">Inicia sesión para ver tus productos favoritos</p>
          <Link to="/login" className="btn-primary inline-block">
            Iniciar Sesión
          </Link>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Mi Lista de Deseos</h2>
          <p className="text-[#7a5d68]">Productos que te gustaron</p>
        </div>
        
        {/* CAMBIO: Mensaje temporal de eliminación */}
        {mensajeEliminacion && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
            {mensajeEliminacion}
          </div>
        )}
        
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#7a5d68] mb-4">No tienes productos en tu lista de deseos</p>
            <Link to="/catalogo" className="btn-primary inline-block">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="card">
                <img 
                  src={item.producto?.imagen} 
                  alt={item.producto?.nombre} 
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                <h3 className="font-bold text-lg">{item.producto?.nombre}</h3>
                <p className="text-sm text-[#7a5d68]">Categoría: {item.producto?.categoria}</p>
                <p className="text-xl font-bold text-[#b83267] my-2">
                  S/ {item.producto?.precio?.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => agregarAlCarrito(item.producto)}
                    className="btn-primary flex-1 text-sm"
                    disabled={item.producto?.stock <= 0}
                  >
                    {item.producto?.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                  <button 
                    onClick={() => eliminarDeWishlist(item.productoId, item.producto?.nombre)}
                    className="btn-danger text-sm px-4"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default Wishlist;