//src\pages\Contacto.jsx
import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { getMensajesContacto, setMensajesContacto } from '../lib/storage';

const Contacto = () => {
  const [formData, setFormData] = useState({ nombre: '', correo: '', mensaje: '' });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarMensaje = () => {
    const { nombre, correo, mensaje: msg } = formData;
    
    if (!nombre || !correo || !msg) {
      setMensaje({ text: 'Complete todos los campos.', type: 'error' });
      return;
    }
    
    const mensajes = getMensajesContacto();
    
    mensajes.unshift({
      id: Date.now(),
      nombre,
      correo,
      mensaje: msg,
      fecha: new Date().toLocaleString(),
      estado: 'nuevo'
    });
    
    setMensajesContacto(mensajes);
    setFormData({ nombre: '', correo: '', mensaje: '' });
    setMensaje({ text: 'Mensaje enviado correctamente.', type: 'success' });
    
    setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="py-10 px-[8%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Contacto</h2>
          <p className="text-[#7a5d68]">Atención personalizada y soporte al cliente</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de contacto */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Información de contacto</h3>
            <div className="space-y-3">
              <p><strong>Correo:</strong> contacto@fashionstore.com</p>
              <p><strong>Teléfono:</strong> +51 999 999 999</p>
              <p><strong>Ubicación:</strong> Perú</p>
              <p><strong>Horario:</strong> Lunes a Sábado 9:00 AM - 8:00 PM</p>
            </div>
          </div>
          
          {/* Formulario de contacto */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Envíanos un mensaje</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" placeholder="Tu nombre" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Correo</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="input-field" placeholder="Tu correo" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Mensaje</label>
                <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} rows="4" className="input-field resize-none" placeholder="Escribe tu mensaje"></textarea>
              </div>
              
              <button onClick={enviarMensaje} className="btn-primary w-full">Enviar mensaje</button>
              
              {mensaje.text && (
                <p className={`text-center font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {mensaje.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Misión, Visión, Compromiso */}
      <section className="py-16 px-[8%] bg-[#fff1f6]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Nuestra empresa</h2>
          <p className="text-[#7a5d68]">Información institucional</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <h3 className="text-xl font-bold mb-3">Misión</h3>
            <p className="text-[#7a5d68]">Brindar una experiencia de compra moderna, eficiente y accesible.</p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-bold mb-3">Visión</h3>
            <p className="text-[#7a5d68]">Convertirnos en líderes digitales del sector moda en Perú.</p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-bold mb-3">Compromiso</h3>
            <p className="text-[#7a5d68]">Garantizar calidad, confianza y mejora continua.</p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contacto;