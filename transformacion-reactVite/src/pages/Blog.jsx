// src/pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getBlogPosts } from '../lib/storage';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [postSeleccionado, setPostSeleccionado] = useState(null);

  useEffect(() => {
    const blogPosts = getBlogPosts();
    setPosts(blogPosts);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Blog de Moda</h2>
          <p className="text-[#7a5d68]">Consejos, tendencias y novedades</p>
        </div>
        
        {postSeleccionado ? (
          <div>
            <button 
              onClick={() => setPostSeleccionado(null)}
              className="text-[#b83267] mb-4 inline-flex items-center gap-2"
            >
              ← Volver al blog
            </button>
            <div className="card">
              <img 
                src={postSeleccionado.imagen} 
                alt={postSeleccionado.titulo} 
                className="w-full h-96 object-cover rounded-xl mb-6"
              />
              <div className="flex justify-between items-center mb-4">
                <span className="tag bg-purple-100 text-purple-700">{postSeleccionado.categoria}</span>
                <span className="text-sm text-[#7a5d68]">{postSeleccionado.fecha}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{postSeleccionado.titulo}</h1>
              <p className="text-[#7a5d68] mb-6">Por {postSeleccionado.autor}</p>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">{postSeleccionado.contenido}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="card cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setPostSeleccionado(post)}
              >
                <img 
                  src={post.imagen} 
                  alt={post.titulo} 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <span className="tag bg-purple-100 text-purple-700 text-xs">
                  {post.categoria}
                </span>
                <h3 className="font-bold text-xl mt-2 mb-2">{post.titulo}</h3>
                <p className="text-sm text-[#7a5d68] mb-2">{post.fecha}</p>
                <p className="text-[#7a5d68]">{post.resumen}</p>
                <button className="text-[#b83267] font-semibold mt-3 hover:underline">
                  Leer más →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default Blog;
