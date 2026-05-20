// src/pages/Catalogo.jsx
// MEJORA 31-40: Catálogo corregido y mejorado

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getProductos, getCarritoLanding, setCarritoLanding, getWishlist, setWishlist, getResenas, setResenas, addLog } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

const Catalogo = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({ categoria: '', color: '', talla: '', precioMin: '', precioMax: '' });
  const [wishlist, setWishlistState] = useState([]);
  const [reseñasModal, setReseñasModal] = useState(null);
  const [reseñas, setReseñas] = useState([]);
  const [nuevaReseña, setNuevaReseña] = useState({ calificacion: 5, comentario: '' });
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState('default'); // 'default', 'price-asc', 'price-desc', 'name-asc'

  // MEJORA 31: Cargar datos iniciales
  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const wishlistData = getWishlist();
      setWishlistState(wishlistData.map(w => w.productoId));
    }
  }, [isAuthenticated]);

  // MEJORA 32: Filtrar y ordenar productos
  useEffect(() => {
    let resultado = [...productos];
    
    // Aplicar filtros
    if (filtros.categoria) {
      resultado = resultado.filter(p => p.categoria === filtros.categoria);
    }
    if (filtros.color) {
      resultado = resultado.filter(p => p.color === filtros.color);
    }
    if (filtros.talla) {
      resultado = resultado.filter(p => p.talla === filtros.talla);
    }
    if (filtros.precioMin) {
      resultado = resultado.filter(p => p.precio >= parseFloat(filtros.precioMin));
    }
    if (filtros.precioMax) {
      resultado = resultado.filter(p => p.precio <= parseFloat(filtros.precioMax));
    }
    
    // Aplicar orden
    switch (orden) {
      case 'price-asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
      case 'name-asc':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      default:
        break;
    }
    
    setProductosFiltrados(resultado);
  }, [productos, filtros, orden]);

  const cargarProductos = () => {
    setCargando(true);
    try {
      const productosData = getProductos();
      const activos = productosData.filter(p => p.estado === 'activo');
      setProductos(activos);
      setProductosFiltrados(activos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ categoria: '', color: '', talla: '', precioMin: '', precioMax: '' });
    setOrden('default');
  };

  const agregarAlCarrito = (producto) => {
    try {
      const carrito = getCarritoLanding();
      const existente = carrito.find(item => item.id === producto.id);
      
      if (existente) {
        if (existente.cantidad + 1 > producto.stock) {
          alert(`Stock máximo: ${producto.stock} unidades`);
          return;
        }
        existente.cantidad += 1;
      } else {
        if (producto.stock <= 0) {
          alert('Producto sin stock');
          return;
        }
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
      addLog('Producto agregado al carrito', currentUser || 'cliente', `Producto: ${producto.nombre}`, 'info');
      alert('Producto agregado al carrito');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar producto');
    }
  };

  // MEJORA 33: Función toggle wishlist mejorada
  const toggleWishlist = (producto) => {
    if (!isAuthenticated) {
      alert('Inicia sesión para agregar a favoritos');
      navigate('/login');
      return;
    }
    
    const wishlistActual = getWishlist();
    const existe = wishlistActual.some(w => w.productoId === producto.id);
    
    if (existe) {
      const nuevaWishlist = wishlistActual.filter(w => w.productoId !== producto.id);
      setWishlist(nuevaWishlist);
      setWishlistState(prev => prev.filter(id => id !== producto.id));
      addLog('Producto eliminado de wishlist', currentUser, `Producto: ${producto.nombre}`, 'info');
      alert('Eliminado de favoritos');
    } else {
      const nuevoFavorito = {
        id: Date.now(),
        productoId: producto.id,
        usuario: currentUser,
        fecha: new Date().toISOString()
      };
      const nuevaWishlist = [nuevoFavorito, ...wishlistActual];
      setWishlist(nuevaWishlist);
      setWishlistState(prev => [...prev, producto.id]);
      addLog('Producto agregado a wishlist', currentUser, `Producto: ${producto.nombre}`, 'info');
      alert('Agregado a favoritos');
    }
  };

  // MEJORA 34: Función para cargar reseñas
  const cargarReseñas = (productoId) => {
    try {
      const todasReseñas = getResenas();
      const productoReseñas = todasReseñas.filter(r => r.productoId === productoId);
      setReseñas(productoReseñas);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      setReseñas([]);
    }
  };

  // MEJORA 35: Función para agregar reseña
  const agregarReseña = (productoId) => {
    if (!isAuthenticated) {
      alert('Inicia sesión para calificar');
      return;
    }
    
    if (!nuevaReseña.comentario.trim()) {
      alert('Escribe un comentario');
      return;
    }
    
    try {
      const reseñaParaAgregar = {
        id: Date.now(),
        productoId,
        usuario: currentUser,
        calificacion: nuevaReseña.calificacion,
        comentario: nuevaReseña.comentario,
        fecha: new Date().toISOString(),
        fechaLocal: new Date().toLocaleString()
      };
      
      const reseñasActuales = getResenas();
      const nuevasReseñas = [reseñaParaAgregar, ...reseñasActuales];
      setResenas(nuevasReseñas);
      cargarReseñas(productoId);
      
      setNuevaReseña({ calificacion: 5, comentario: '' });
      addLog('Reseña agregada', currentUser, `Producto ID: ${productoId} - Calificación: ${nuevaReseña.calificacion}`, 'info');
      alert('Gracias por tu calificación');
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      alert('Error al guardar la reseña');
    }
  };

  const abrirModalReseñas = (producto) => {
    setReseñasModal(producto);
    cargarReseñas(producto.id);
  };

  const cerrarModalReseñas = () => {
    setReseñasModal(null);
    setNuevaReseña({ calificacion: 5, comentario: '' });
  };

  // MEJORA 36: Calcular promedio de calificación
  const getPromedioCalificacion = (productoId) => {
    const productoReseñas = reseñasModal?.id === productoId ? reseñas : getResenas().filter(r => r.productoId === productoId);
    if (productoReseñas.length === 0) return 0;
    const suma = productoReseñas.reduce((acc, r) => acc + r.calificacion, 0);
    return (suma / productoReseñas.length).toFixed(1);
  };

  const coloresUnicos = [...new Set(productos.map(p => p.color))];
  const tallasUnicas = [...new Set(productos.map(p => p.talla))];
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Catálogo</h2>
          <p className="text-[#7a5d68]">Explora nuestros productos disponibles</p>
          <p className="text-sm text-[#7a5d68] mt-2">{productosFiltrados.length} productos encontrados</p>
        </div>
        
        {/* MEJORA 37: Filtros mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Categoría</label>
            <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="input-field text-sm">
              <option value="">Todas</option>
              {categoriasUnicas.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Color</label>
            <select name="color" value={filtros.color} onChange={handleFiltroChange} className="input-field text-sm">
              <option value="">Todos</option>
              {coloresUnicos.map(color => <option key={color}>{color}</option>)}
            </select>
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Talla</label>
            <select name="talla" value={filtros.talla} onChange={handleFiltroChange} className="input-field text-sm">
              <option value="">Todas</option>
              {tallasUnicas.map(talla => <option key={talla}>{talla}</option>)}
            </select>
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Precio min (S/)</label>
            <input type="number" name="precioMin" value={filtros.precioMin} onChange={handleFiltroChange} className="input-field text-sm" placeholder="0" />
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Precio max (S/)</label>
            <input type="number" name="precioMax" value={filtros.precioMax} onChange={handleFiltroChange} className="input-field text-sm" placeholder="1000" />
          </div>
          
          <div className="card">
            <label className="block font-bold mb-2 text-sm">Ordenar por</label>
            <select value={orden} onChange={(e) => setOrden(e.target.value)} className="input-field text-sm">
              <option value="default">Por defecto</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A a Z</option>
            </select>
          </div>
        </div>
        
        {/* MEJORA 38: Botón limpiar filtros */}
        {(filtros.categoria || filtros.color || filtros.talla || filtros.precioMin || filtros.precioMax || orden !== 'default') && (
          <div className="text-center mb-6">
            <button onClick={limpiarFiltros} className="text-sm text-[#b83267] hover:underline">
              Limpiar todos los filtros
            </button>
          </div>
        )}
        
        {/* Productos */}
        {cargando ? (
          <div className="text-center py-12">
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[#f1d7e1] relative group">
                <button 
                  onClick={() => toggleWishlist(producto)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition z-10"
                >
                  {wishlist.includes(producto.id) ? '❤️' : '🤍'}
                </button>

                <img src={producto.imagen} alt={producto.nombre} className="w-full h-64 object-cover group-hover:scale-105 transition duration-300" />
                <div className="p-5">
                  <span className="inline-block bg-[#ffe1ec] text-[#b83267] text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {producto.categoria}
                  </span>
                  <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
                  <p className="text-sm text-[#7a5d68]">Color: {producto.color} | Talla: {producto.talla}</p>
                  <p className={`text-sm mb-2 ${producto.stock <= 5 ? 'text-orange-600' : 'text-[#7a5d68]'}`}>
                    Stock: {producto.stock} unidades {producto.stock <= 5 && '(¡Últimas unidades!)'}
                  </p>
                  <p className="text-xl font-bold text-[#b83267] mb-4">S/ {producto.precio.toFixed(2)}</p>
                  
                  {/* MEJORA 39: Botón ver reseñas */}
                  <button 
                    onClick={() => abrirModalReseñas(producto)}
                    className="text-xs text-[#7a5d68] hover:text-[#b83267] mb-2 block"
                  >
                    ⭐ Ver reseñas
                  </button>
                  
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
        )}
        
        {productosFiltrados.length === 0 && !cargando && (
          <div className="text-center py-12">
            <p className="text-[#7a5d68] mb-4">No hay productos disponibles con los filtros seleccionados.</p>
            <button onClick={limpiarFiltros} className="btn-secondary">Limpiar filtros</button>
          </div>
        )}
      </section>
      
      {/* MEJORA 40: Modal de reseñas */}
      {reseñasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={cerrarModalReseñas}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{reseñasModal.nombre}</h3>
              <button onClick={cerrarModalReseñas} className="text-2xl">&times;</button>
            </div>
            
            <div className="mb-4 text-center">
              <span className="text-2xl">⭐ {getPromedioCalificacion(reseñasModal.id)}/5</span>
              <p className="text-sm text-[#7a5d68]">{reseñas.length} reseñas</p>
            </div>
            
            {/* Formulario nueva reseña */}
            {isAuthenticated && (
              <div className="border-b border-[#f1d7e1] pb-4 mb-4">
                <h4 className="font-bold mb-2">Deja tu reseña</h4>
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNuevaReseña(prev => ({ ...prev, calificacion: star }))}
                      className={`text-2xl ${star <= nuevaReseña.calificacion ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={nuevaReseña.comentario}
                  onChange={(e) => setNuevaReseña(prev => ({ ...prev, comentario: e.target.value }))}
                  className="input-field w-full mb-2"
                  rows="3"
                  placeholder="Escribe tu comentario..."
                />
                <button onClick={() => agregarReseña(reseñasModal.id)} className="btn-primary w-full">
                  Enviar reseña
                </button>
              </div>
            )}
            
            {/* Lista de reseñas */}
            <div className="space-y-3">
              {reseñas.length === 0 ? (
                <p className="text-center text-[#7a5d68]">No hay reseñas aún. Sé el primero en calificar.</p>
              ) : (
                reseñas.map(r => (
                  <div key={r.id} className="border-b border-[#f1d7e1] pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{r.usuario}</span>
                      <span className="text-sm text-[#7a5d68]">{r.fechaLocal || new Date(r.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="text-yellow-500">{'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}</div>
                    <p className="text-[#7a5d68] text-sm mt-1">{r.comentario}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Catalogo;