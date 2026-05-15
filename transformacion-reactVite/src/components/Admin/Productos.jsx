// src/components/Admin/Productos.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, setProductos, getProveedores, addLog } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

const Productos = () => {
  const [productos, setProductosState] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Ropa',
    color: '',
    talla: '',
    precio: '',
    stock: '',
    stockMinimo: '5',
    proveedor: '',
    imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    estado: 'activo'
  });

  useEffect(() => {
    cargarProductos();
    setProveedores(getProveedores());
  }, []);

  const cargarProductos = () => {
    setProductosState(getProductos());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarProducto = () => {
    if (!formData.nombre || !formData.precio || !formData.stock) {
      alert('Complete los campos requeridos');
      return;
    }

    const productosActuales = getProductos();
    
    if (editando) {
      // Editar
      const nuevosProductos = productosActuales.map(p => 
        p.id === editando ? { ...formData, id: editando } : p
      );
      setProductos(nuevosProductos);
      addLog(`Producto actualizado`, currentUser, `Producto: ${formData.nombre}`);
      alert('Producto actualizado correctamente');
    } else {
      // Nuevo
      const nuevoId = Math.max(...productosActuales.map(p => p.id), 0) + 1;
      const nuevoProducto = { ...formData, id: nuevoId };
      setProductos([...productosActuales, nuevoProducto]);
      addLog(`Producto creado`, currentUser, `Producto: ${formData.nombre}`);
      alert('Producto agregado correctamente');
    }
    
    cargarProductos();
    setShowModal(false);
    setEditando(null);
    resetForm();
  };

  const eliminarProducto = (id) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      const productosActuales = getProductos();
      const producto = productosActuales.find(p => p.id === id);
      const nuevosProductos = productosActuales.filter(p => p.id !== id);
      setProductos(nuevosProductos);
      addLog(`Producto eliminado`, currentUser, `Producto: ${producto?.nombre}`);
      cargarProductos();
    }
  };

  const editarProducto = (producto) => {
    setFormData(producto);
    setEditando(producto.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: 'Ropa',
      color: '',
      talla: '',
      precio: '',
      stock: '',
      stockMinimo: '5',
      proveedor: '',
      imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
      estado: 'activo'
    });
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-field max-w-xs"
        />
        <button onClick={() => {
          resetForm();
          setEditando(null);
          setShowModal(true);
        }} className="btn-primary">
          + Nuevo Producto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosFiltrados.map(producto => (
          <div key={producto.id} className="card">
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-cover rounded-xl mb-4" />
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{producto.nombre}</h3>
              <span className={`tag ${producto.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {producto.estado}
              </span>
            </div>
            <p className="text-sm text-[#7a5d68]">Categoría: {producto.categoria}</p>
            <p className="text-sm text-[#7a5d68]">Color: {producto.color} | Talla: {producto.talla}</p>
            <p className="text-sm font-semibold">Stock: {producto.stock} (Mín: {producto.stockMinimo})</p>
            <p className="text-xl font-bold text-[#b83267] my-2">S/ {producto.precio}</p>
            <div className="flex gap-2">
              <button onClick={() => editarProducto(producto)} className="btn-secondary flex-1 text-sm">
                Editar
              </button>
              <button onClick={() => eliminarProducto(producto.id)} className="btn-danger flex-1 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-4">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Nombre *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="input-field">
                  <option>Ropa</option><option>Calzado</option><option>Accesorio</option>
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Talla</label>
                <input type="text" name="talla" value={formData.talla} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Precio (S/) *</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} className="input-field" step="0.01" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Stock Mínimo</label>
                <input type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleChange} className="input-field" />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Proveedor</label>
                <select name="proveedor" value={formData.proveedor} onChange={handleChange} className="input-field">
                  <option value="">Seleccionar</option>
                  {proveedores.map(p => <option key={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="input-field">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">URL de Imagen</label>
                <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} className="input-field" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={guardarProducto} className="btn-primary flex-1">
                {editando ? 'Actualizar' : 'Guardar'}
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

export default Productos;