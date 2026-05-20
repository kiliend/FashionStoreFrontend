// src/pages/Catalogo.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getProductos, getCarritoLanding, setCarritoLanding, getWishlist, setWishlist, getResenas, setResenas, addLog } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import StarRating, { RatingAverage } from '../components/UI/StarRating';
import Modal from '../components/UI/Modal';
import Spinner from '../components/UI/Spinner';
import Pagination from '../components/UI/Pagination';

const Catalogo = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({ categoria: '', color: '', talla: '' });
  const [wishlist, setWishlistState] = useState([]);
  const [reseñasModal, setReseñasModal] = useState(null);
  const [reseñasProducto, setReseñasProducto] = useState([]);
  const [nuevaReseña, setNuevaReseña] = useState({ calificacion: 0, comentario: '' });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const wishlistData = getWishlist();
      setWishlistState(wishlistData.map(w => w.productoId));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filtrarProductos();
  }, [filtros, productos]);

  const cargarDatos = async () => {
    setLoading(true);
    // Simular carga asíncrona
    setTimeout(() => {
      const productosData = getProductos();
      setProductos(productosData.filter(p => p.estado === 'activo'));
      setLoading(false);
    }, 500);
  };

  const filtrarProductos = () => {
    let filtrados = productos.filter(p => p.estado === 'activo');
    
    if (filtros.categoria) {
      filtrados = filtrados.filter(p => p.categoria === filtros.categoria);
    }
    if (filtros.color) {
      filtrados = filtrados.filter(p => p.color === filtros.color);
    }
    if (filtros.talla) {
      filtrados = filtrados.filter(p => p.talla === filtros.talla);
    }
    
    setProductosFiltrados(filtrados);
    setCurrentPage(1);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ categoria: '', color: '', talla: '' });
  };

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
    mostrarToast(`${producto.nombre} agregado al carrito`, 'success');
  };

  const toggleWishlist = (producto) => {
    if (!isAuthenticated) {
      mostrarToast('Inicia sesión para agregar a favoritos', 'warning');
      navigate('/login');
      return;
    }
    
    const wishlistActual = getWishlist();
    const existe = wishlistActual.some(w => w.productoId === producto.id);
    
    if (existe) {
      const nuevaWishlist = wishlistActual.filter(w => w.productoId !== producto.id);
      setWishlist(nuevaWishlist);
      setWishlistState(prev => prev.filter(id => id !== producto.id));
      addLog(`Producto eliminado de wishlist`, currentUser, `Producto: ${producto.nombre}`);
      mostrarToast(`${producto.nombre} eliminado de favoritos`, 'info');
    } else {
      const nuevoFavorito = {
        id: Date.now(),
        productoId: producto.id,
        usuario: currentUser,
        fecha: new Date().toLocaleString()
      };
      setWishlist([nuevoFavorito, ...wishlistActual]);
      setWishlistState(prev => [...prev, producto.id]);
      addLog(`Producto agregado a wishlist`, currentUser, `Producto: ${producto.nombre}`);
      mostrarToast(`${producto.nombre} agregado a favoritos`, 'success');
    }
  };

  const abrirModalReseñas = (producto) => {
    const todasReseñas = getResenas();
    const reseñasProductoFiltradas = todasReseñas.filter(r => r.productoId === producto.id);
    setReseñasProducto(reseñasProductoFiltradas);
    setReseñasModal(producto);
    setNuevaReseña({ calificacion: 0, comentario: '' });
  };

  const agregarReseña = () => {
    if (!isAuthenticated) {
      mostrarToast('Inicia sesión para calificar', 'warning');
      return;
    }
    
    if (nuevaReseña.calificacion === 0) {
      mostrarToast('Selecciona una calificación', 'warning');
      return;
    }
    
    if (!nuevaReseña.comentario.trim()) {
      mostrarToast('Escribe un comentario', 'warning');
      return;
    }
    
    const reseñaData = {
      id: Date.now(),
      productoId: reseñasModal.id,
      usuario: currentUser,
      calificacion: nuevaReseña.calificacion,
      comentario: nuevaReseña.comentario,
      fecha: new Date().toLocaleString()
    };
    
    const reseñasActuales = getResenas();
    setResenas([reseñaData, ...reseñasActuales]);
    
    // Actualizar reseñas en modal
    const todasReseñas = getResenas();
    const reseñasProductoFiltradas = todasReseñas.filter(r => r.productoId === reseñasModal.id);
    setReseñasProducto(reseñasProductoFiltradas);
    
    setNuevaReseña({ calificacion: 0, comentario: '' });
    addLog(`Reseña agregada`, currentUser, `Producto: ${reseñasModal.nombre}, Calificación: ${nuevaReseña.calificacion}`);
    mostrarToast('Gracias por tu calificación', 'success');
  };

  const mostrarToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Obtener valores únicos para filtros
  const coloresUnicos = [...new Set(productos.map(p => p.color).filter(Boolean))];
  const tallasUnicas = [...new Set(productos.map(p => p.talla).filter(Boolean))];

  // Paginación
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const paginatedProducts = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcular rating promedio de un producto
  const getProductRating = (productoId) => {
    const todasReseñas = getResenas();
    const reseñasProducto = todasReseñas.filter(r => r.productoId === productoId);
    if (reseñasProducto.length === 0) return null;
    const avg = reseñasProducto.reduce((sum, r) => sum + r.calificacion, 0) / reseñasProducto.length;
    return { avg, count: reseñasProducto.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          } text-white`}>
            <span className="text-xl">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Catálogo</h2>
          <p className="text-[#7a5d68]">Explora nuestros productos disponibles</p>
        </div>
        
        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-[#f1d7e1] shadow-soft p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Filtros</h3>
            <button onClick={limpiarFiltros} className="text-sm text-[#b83267] hover:underline">
              Limpiar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-2">Categoría</label>
              <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="input-field">
                <option value="">Todas</option>
                <option value="Ropa">Ropa</option>
                <option value="Calzado">Calzado</option>
                <option value="Accesorio">Accesorio</option>
              </select>
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Color</label>
              <select name="color" value={filtros.color} onChange={handleFiltroChange} className="input-field">
                <option value="">Todos</option>
                {coloresUnicos.map(color => <option key={color}>{color}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Talla</label>
              <select name="talla" value={filtros.talla} onChange={handleFiltroChange} className="input-field">
                <option value="">Todas</option>
                {tallasUnicas.map(talla => <option key={talla}>{talla}</option>)}
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-[#7a5d68]">
                {productosFiltrados.length} productos encontrados
              </div>
            </div>
          </div>
        </div>
        
        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((producto) => {
            const rating = getProductRating(producto.id);
            return (
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
                  <p className="text-sm text-[#7a5d68] mb-2">Stock: {producto.stock} unidades</p>
                  
                  {/* Rating */}
                  {rating && (
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={rating.avg} readonly size="sm" />
                      <span className="text-xs text-gray-500">({rating.count})</span>
                    </div>
                  )}
                  
                  <p className="text-xl font-bold text-[#b83267] mb-4">S/ {producto.precio.toFixed(2)}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => agregarAlCarrito(producto)} 
                      disabled={producto.stock <= 0}
                      className={`btn-primary flex-1 text-center ${producto.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                    <button
                      onClick={() => abrirModalReseñas(producto)}
                      className="bg-gray-100 text-gray-700 px-3 rounded-xl hover:bg-gray-200 transition"
                      title="Ver reseñas"
                    >
                      ★
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#7a5d68] text-lg mb-4">No hay productos disponibles con los filtros seleccionados.</p>
            <button onClick={limpiarFiltros} className="btn-primary">
              Limpiar filtros
            </button>
          </div>
        )}
        
        {/* Paginación */}
        {productosFiltrados.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
      
      {/* Modal de Reseñas */}
      <Modal
        isOpen={!!reseñasModal}
        onClose={() => setReseñasModal(null)}
        title={`Reseñas - ${reseñasModal?.nombre}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Formulario nueva reseña */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold mb-3">Escribe tu reseña</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Calificación</label>
                <StarRating
                  rating={nuevaReseña.calificacion}
                  onRatingChange={(val) => setNuevaReseña({ ...nuevaReseña, calificacion: val })}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Comentario</label>
                <textarea
                  value={nuevaReseña.comentario}
                  onChange={(e) => setNuevaReseña({ ...nuevaReseña, comentario: e.target.value })}
                  rows="3"
                  className="input-field"
                  placeholder="¿Qué te pareció el producto?"
                />
              </div>
              <button onClick={agregarReseña} className="btn-primary w-full">
                Enviar reseña
              </button>
            </div>
          </div>
          
          {/* Lista de reseñas */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h4 className="font-bold">Opiniones de clientes ({reseñasProducto.length})</h4>
            {reseñasProducto.length === 0 ? (
              <p className="text-[#7a5d68] text-center py-4">No hay reseñas para este producto aún.</p>
            ) : (
              reseñasProducto.map(reseña => (
                <div key={reseña.id} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <StarRating rating={reseña.calificacion} readonly size="sm" />
                      <p className="font-semibold mt-1">{reseña.usuario}</p>
                    </div>
                    <span className="text-xs text-[#7a5d68]">{reseña.fecha}</span>
                  </div>
                  <p className="text-[#7a5d68]">{reseña.comentario}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
      
      <Footer />
    </div>
  );
};

export default Catalogo;
