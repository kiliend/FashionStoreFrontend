// src/pages/Faq.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getFaq } from '../lib/storage';

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [preguntasAbiertas, setPreguntasAbiertas] = useState([]);

  useEffect(() => {
    const faqsData = getFaq();
    setFaqs(faqsData);
  }, []);

  const togglePregunta = (id) => {
    setPreguntasAbiertas(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const categorias = ['Todas', ...new Set(faqs.map(f => f.categoria))];
  
  const faqsFiltrados = categoriaActiva === 'Todas' 
    ? faqs 
    : faqs.filter(f => f.categoria === categoriaActiva);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Preguntas Frecuentes</h2>
          <p className="text-[#7a5d68]">Encuentra respuestas a tus dudas</p>
        </div>
        
        {/* Categorías */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                categoriaActiva === cat 
                  ? 'bg-gradient-to-r from-[#d9467a] to-[#b83267] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqsFiltrados.map(faq => (
            <div key={faq.id} className="card">
              <button
                onClick={() => togglePregunta(faq.id)}
                className="w-full text-left flex justify-between items-center"
              >
                <h3 className="font-bold text-lg">{faq.pregunta}</h3>
                <span className="text-2xl">
                  {preguntasAbiertas.includes(faq.id) ? '−' : '+'}
                </span>
              </button>
              {preguntasAbiertas.includes(faq.id) && (
                <div className="mt-3 pt-3 border-t border-[#f1d7e1]">
                  <p className="text-[#7a5d68]">{faq.respuesta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {faqsFiltrados.length === 0 && (
          <p className="text-center text-[#7a5d68] py-8">No hay preguntas en esta categoría</p>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default Faq;
