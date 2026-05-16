// src/components/Admin/Blog.jsx
import React, { useState, useEffect } from 'react';
import { getBlogPosts, setBlogPosts, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    categoria: 'Tendencias',
    imagen: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    autor: currentUser
  });

  useEffect(() => {
    cargarPosts();
  }, []);

  const cargarPosts = () => {
    setPosts(getBlogPosts());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarPost = () => {
    if (!formData.titulo || !formData.resumen || !formData.contenido) {
      alert('Complete los campos requeridos');
      return;
    }

    const postsActuales = getBlogPosts();
    
    if (editando) {
      const nuevosPosts = postsActuales.map(p => 
        p.id === editando ? { ...formData, id: editando, fecha: new Date().toISOString().split('T')[0] } : p
      );
      setBlogPosts(nuevosPosts);
      addLog(`Post actualizado`, currentUser, `Título: ${formData.titulo}`);
      alert('Post actualizado correctamente');
    } else {
      const nuevoId = Math.max(...postsActuales.map(p => p.id), 0) + 1;
      setBlogPosts([...postsActuales, { 
        ...formData, 
        id: nuevoId, 
        fecha: new Date().toISOString().split('T')[0],
        autor: currentUser 
      }]);
      addLog(`Post creado`, currentUser, `Título: ${formData.titulo}`);
      alert('Post agregado correctamente');
    }
    
    cargarPosts();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarPost = (id) => {
    if (confirm('¿Está seguro de eliminar este post?')) {
      const postsActuales = getBlogPosts();
      const post = postsActuales.find(p => p.id === id);
      const nuevosPosts = postsActuales.filter(p => p.id !== id);
      setBlogPosts(nuevosPosts);
      addLog(`Post eliminado`, currentUser, `Título: ${post?.titulo}`);
      cargarPosts();
    }
  };

  const editarPost = (post) => {
    setFormData(post);
    setEditando(post.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      resumen: '',
      contenido: '',
      categoria: 'Tendencias',
      imagen: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      autor: currentUser
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog - Noticias de Moda</h2>
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nuevo Artículo
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <img src={post.imagen} alt={post.titulo} className="w-full md:w-48 h-32 object-cover rounded-xl" />
              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="tag bg-purple-100 text-purple-700">{post.categoria}</span>
                    <h3 className="text-xl font-bold mt-2">{post.titulo}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editarPost(post)} className="btn-secondary text-sm">
                      Editar
                    </button>
                    <button onClick={() => eliminarPost(post.id)} className="btn-danger text-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#7a5d68] mt-2">
                  Por {post.autor} | {post.fecha}
                </p>
                <p className="mt-2 text-[#7a5d68]">{post.resumen}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {posts.length === 0 && (
        <p className="text-center text-[#7a5d68] py-8">No hay artículos publicados</p>
      )}
      
      {/* Modal Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Título *</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="input-field">
                  <option>Tendencias</option>
                  <option>Consejos</option>
                  <option>Cuidado</option>
                  <option>Lanzamientos</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">URL de Imagen</label>
                <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Resumen *</label>
                <textarea name="resumen" value={formData.resumen} onChange={handleChange} rows="2" className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Contenido *</label>
                <textarea name="contenido" value={formData.contenido} onChange={handleChange} rows="6" className="input-field" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarPost} className="btn-primary flex-1">
                {editando ? 'Actualizar' : 'Publicar'}
              </button>
              <button onClick={() => {
                setShowModal(false);
                setEditando(null);
                resetForm();
              }} className="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
