import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getProductos } from '../lib/storage';

const Landing = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);

  useEffect(() => {
    const productos = getProductos();
    setProductosDestacados(productos.slice(0, 4));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <header className="min-h-screen py-8 px-[8%] bg-gradient-to-br from-[#fff0f5] to-[#ffe7ef]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <span className="inline-block bg-[#ffe1ec] text-[#b83267] px-4 py-2 rounded-full font-bold mb-4">
              Nueva colección 2026
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
          </div>
          
          <div className="grid gap-5">
            <div className="bg-white/90 border border-[#f1d7e1] rounded-2xl p-6 shadow-soft">
              <span className="font-bold text-[#b83267]">🔥 Ofertas</span>
              <h3 className="text-xl font-bold my-2">Promociones exclusivas</h3>
              <p className="text-[#7a5d68]">Encuentra descuentos en productos seleccionados.</p>
            </div>
            <div className="bg-white/90 border border-[#f1d7e1] rounded-2xl p-6 shadow-soft">
              <span className="font-bold text-[#b83267]">🚚 Entrega</span>
              <h3 className="text-xl font-bold my-2">Compra rápida</h3>
              <p className="text-[#7a5d68]">Navega por categorías y compra con facilidad.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sobre Nosotros */}
      <section className="py-20 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Sobre FashionStore</h2>
          <p className="text-[#7a5d68]">Conoce más sobre nuestra empresa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-3">¿Quiénes somos?</h3>
            <p className="text-[#7a5d68]">
              FashionStore es una tienda digital especializada en la venta de ropa,
              calzado y accesorios modernos.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3">Misión</h3>
            <p className="text-[#7a5d68]">
              Ofrecer productos de moda de calidad mediante una plataforma tecnológica
              eficiente.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3">Visión</h3>
            <p className="text-[#7a5d68]">
              Ser una tienda digital líder en el mercado peruano, destacando por innovación.
            </p>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 px-[8%] bg-[#fff1f6]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Categorías destacadas</h2>
          <p className="text-[#7a5d68]">Explora nuestros productos principales</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Ropa', 'Calzado', 'Accesorios'].map((cat) => (
            <div key={cat} className="card text-center">
              <h3 className="text-xl font-bold mb-3">{cat}</h3>
              <p className="text-[#7a5d68] mb-4">
                {cat === 'Ropa' && 'Polos, casacas, pantalones y prendas urbanas.'}
                {cat === 'Calzado' && 'Zapatillas y estilos modernos para tu día a día.'}
                {cat === 'Accesorios' && 'Bolsos, gorras y complementos para cada look.'}
              </p>
              <Link to="/catalogo" className="btn-secondary inline-block">
                Explorar
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Productos destacados</h2>
          <p className="text-[#7a5d68]">Algunos de nuestros favoritos de la temporada</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosDestacados.map((producto) => (
            <div key={producto.id} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[#f1d7e1]">
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-64 object-cover" />
              <div className="p-5">
                <span className="inline-block bg-[#ffe1ec] text-[#b83267] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {producto.categoria}
                </span>
                <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
                <p className="text-xl font-bold text-[#b83267] mb-4">S/ {producto.precio.toFixed(2)}</p>
                <Link to="/catalogo" className="btn-primary block text-center">
                  Ver producto
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;