// src/pages/Landing.jsx
// MEJORA 41-45: Landing mejorado

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getProductos, getBlogPosts, getCupones } from '../lib/storage';

const Landing = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [ultimosPosts, setUltimosPosts] = useState([]);
  const [cuponActivo, setCuponActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setLoading(true);
    try {
      const productos = getProductos();
      const activos = productos.filter(p => p.estado === 'activo');
      // MEJORA 41: Seleccionar productos aleatorios como destacados
      const destacados = [...activos].sort(() => 0.5 - Math.random()).slice(0, 4);
      setProductosDestacados(destacados);
      
      const posts = getBlogPosts();
      setUltimosPosts(posts.slice(0, 3));
      
      const cupones = getCupones();
      const cuponValido = cupones.find(c => !c.usado && new Date(c.validoHasta) > new Date());
      setCuponActivo(cuponValido);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // MEJORA 42: Scroll suave al hacer clic en enlaces
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section mejorado */}
      <header className="min-h-screen py-8 px-[8%] bg-gradient-to-br from-[#fff0f5] to-[#ffe7ef]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <span className="inline-block bg-[#ffe1ec] text-[#b83267] px-4 py-2 rounded-full font-bold mb-4 animate-pulse">
              🔥 Nueva colección 2026
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              Moda moderna para cada estilo
            </h1>
            <p className="text-[#7a5d68] text-lg mb-6 max-w-xl">
              Descubre ropa, calzado y accesorios en una experiencia más organizada,
              visual y profesional.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/catalogo" className="btn-primary">
                Ver catálogo
              </Link>
              <Link to="/carrito" className="btn-secondary">
                Ir al carrito
              </Link>
            </div>
            
            {/* MEJORA 43: Mostrar cupón activo */}
            {cuponActivo && (
              <div className="mt-6 p-4 bg-green-100 rounded-xl border border-green-300">
                <p className="font-bold text-green-800">🎁 Cupón activo: {cuponActivo.codigo}</p>
                <p className="text-sm text-green-700">
                  {cuponActivo.tipo === 'porcentaje' 
                    ? `${cuponActivo.descuento}% de descuento` 
                    : `S/ ${cuponActivo.descuento} de descuento`}
                  {cuponActivo.minCompra > 0 && ` (mínimo S/ ${cuponActivo.minCompra})`}
                </p>
              </div>
            )}
          </div>
          
          <div className="grid gap-5">
            <div className="bg-white/90 border border-[#f1d7e1] rounded-2xl p-6 shadow-soft hover:shadow-lg transition">
              <span className="font-bold text-[#b83267]">🔥 Ofertas</span>
              <h3 className="text-xl font-bold my-2">Promociones exclusivas</h3>
              <p className="text-[#7a5d68]">Encuentra descuentos en productos seleccionados.</p>
            </div>
            <div className="bg-white/90 border border-[#f1d7e1] rounded-2xl p-6 shadow-soft hover:shadow-lg transition">
              <span className="font-bold text-[#b83267]">🚚 Entrega</span>
              <h3 className="text-xl font-bold my-2">Compra rápida</h3>
              <p className="text-[#7a5d68]">Navega por categorías y compra con facilidad.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sobre Nosotros con mejor visual */}
      <section id="sobre-nosotros" className="py-20 px-[8%]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Sobre FashionStore</h2>
          <p className="text-[#7a5d68]">Conoce más sobre nuestra empresa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card group hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <span className="text-4xl mb-3 block">👥</span>
              <h3 className="text-xl font-bold mb-3">¿Quiénes somos?</h3>
              <p className="text-[#7a5d68]">
                FashionStore es una tienda digital especializada en la venta de ropa,
                calzado y accesorios modernos.
              </p>
            </div>
          </div>
          <div className="card group hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🎯</span>
              <h3 className="text-xl font-bold mb-3">Misión</h3>
              <p className="text-[#7a5d68]">
                Ofrecer productos de moda de calidad mediante una plataforma tecnológica
                eficiente.
              </p>
            </div>
          </div>
          <div className="card group hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <span className="text-4xl mb-3 block">👁️</span>
              <h3 className="text-xl font-bold mb-3">Visión</h3>
              <p className="text-[#7a5d68]">
                Ser una tienda digital líder en el mercado peruano, destacando por innovación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" className="py-20 px-[8%] bg-[#fff1f6]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Categorías destacadas</h2>
          <p className="text-[#7a5d68]">Explora nuestros productos principales</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Ropa', desc: 'Polos, casacas, pantalones y prendas urbanas.', icon: '👕' },
            { name: 'Calzado', desc: 'Zapatillas y estilos modernos para tu día a día.', icon: '👟' },
            { name: 'Accesorios', desc: 'Bolsos, gorras y complementos para cada look.', icon: '👜' }
          ].map((cat) => (
            <div key={cat.name} className="card text-center group hover:shadow-xl transition-all duration-300">
              <span className="text-5xl mb-4 block">{cat.icon}</span>
              <h3 className="text-xl font-bold mb-3">{cat.name}</h3>
              <p className="text-[#7a5d68] mb-4">{cat.desc}</p>
              <Link to="/catalogo" className="btn-secondary inline-block" onClick={() => localStorage.setItem('filtroCategoria', cat.name)}>
                Explorar {cat.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Productos Destacados mejorado */}
      <section id="productos" className="py-20 px-[8%]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Productos destacados</h2>
          <p className="text-[#7a5d68]">Algunos de nuestros favoritos de la temporada</p>
        </div>
        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[#f1d7e1] group hover:shadow-xl transition-all duration-300">
                <img src={producto.imagen} alt={producto.nombre} className="w-full h-64 object-cover group-hover:scale-105 transition duration-300" />
                <div className="p-5">
                  <span className="inline-block bg-[#ffe1ec] text-[#b83267] text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {producto.categoria}
                  </span>
                  <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xl font-bold text-[#b83267]">S/ {producto.precio.toFixed(2)}</p>
                    {producto.stock <= 5 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        ¡Últimas unidades!
                      </span>
                    )}
                  </div>
                  <Link to="/catalogo" className="btn-primary block text-center">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MEJORA 44: Sección de blog */}
      {ultimosPosts.length > 0 && (
        <section className="py-20 px-[8%] bg-[#fff1f6]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Últimos artículos</h2>
            <p className="text-[#7a5d68]">Consejos y tendencias de moda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ultimosPosts.map(post => (
              <Link key={post.id} to="/blog" className="card group hover:shadow-xl transition-all">
                <img src={post.imagen} alt={post.titulo} className="w-full h-48 object-cover rounded-xl mb-4" />
                <span className="text-xs text-[#7a5d68]">{post.fecha}</span>
                <h3 className="font-bold text-lg mt-2 group-hover:text-[#b83267] transition">{post.titulo}</h3>
                <p className="text-[#7a5d68] text-sm">{post.resumen?.substring(0, 100)}...</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MEJORA 45: Newsletter */}
      <section className="py-20 px-[8%]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Suscríbete a nuestro newsletter</h2>
          <p className="text-[#7a5d68] mb-6">Recibe ofertas exclusivas y novedades directamente en tu correo</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="input-field flex-1"
            />
            <button className="btn-primary">
              Suscribirme
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;