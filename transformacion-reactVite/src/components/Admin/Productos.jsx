//src\components\Admin\Productos.jsx
import React, { useState, useEffect } from 'react';
import { getProductos, setProductos } from '../../lib/storage';

const Productos = () => {
  const [productos, setProductosState] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    color: '',
    talla: '',
    precio: '',
    stock: '',
    imagen: null,
    imagenPreview: ''
  });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    setProductosState(getProductos());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagen: file, imagenPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const actualizarTallas = () => {
    const categoria = formData.categoria;
    let tallas = [];
    
    if (categoria === 'Ropa') {
      tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    } else if (categoria === 'Calzado') {
      tallas = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
    } else if (categoria === 'Accesorio') {
      tallas = ['Única'];
    }
    
    return tallas;
  };

  const guardarProducto = () => {
    const { nombre, categoria, color, talla, precio, stock, imagen, imagenPreview } = formData;
    
    if (!nombre || !categoria || !color || !talla || !precio || !stock) {
      setMensaje({ text: 'Complete todos los campos obligatorios.', type: 'error' });
      return;
    }
    
    if (Number(precio) <= 0 || Number(stock) < 0) {
      setMensaje({ text: 'Ingrese valores válidos en precio y stock.', type: 'error' });
      return;
    }
    
    if (editandoId !== null) {
      // Editar producto
      const productosActualizados = productos.map(p => 
        p.id === editandoId 
          ? { ...p, nombre, categoria, color, talla, precio: Number(precio), stock: Number(stock) }
          : p
      );
      setProductos(productosActualizados);
      setProductosState(productosActualizados);
      setMensaje({ text: 'Producto actualizado correctamente.', type: 'success' });
      setEditandoId(null);
      limpiarFormulario();
    } else {
      // Nuevo producto
      if (!imagen) {
        setMensaje({ text: 'Debe seleccionar una imagen.', type: 'error' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const nuevoProducto = {
          id: Date.now(),
          nombre,
          categoria,
          color,
          talla,
          precio: Number(precio),
          stock: Number(stock),
          imagen: reader.result,
          estado: 'activo'
        };
        
        const nuevosProductos = [nuevoProducto, ...productos];
        setProductos(nuevosProductos);
        setProductosState(nuevosProductos);
        setMensaje({ text: 'Producto registrado correctamente.', type: 'success' });
        limpiarFormulario();
      };
      reader.readAsDataURL(imagen);
    }
  };

  const setProductos = (data) => {
    setProductosState(data);
    setProductos(data);
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setFormData({
      nombre: producto.nombre,
      categoria: producto.categoria,
      color: producto.color,
      talla: producto.talla,
      precio: producto.precio,
      stock: producto.stock,
      imagen: null,
      imagenPreview: producto.imagen
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEstadoProducto = (id) => {
    const productosActualizados = productos.map(p =>
      p.id === id ? { ...p, estado: p.estado === 'activo' ? 'inactivo' : 'activo' } : p
    );
    setProductos(productosActualizados);
    setProductosState(productosActualizados);
    setMensaje({ text: 'Estado actualizado.', type: 'success' });
  };

  const eliminarProducto = (id) => {
    if (confirm('¿Desea eliminar este producto?')) {
      const productosActualizados = productos.filter(p => p.id !== id);
      setProductos(productosActualizados);
      setProductosState(productosActualizados);
      setMensaje({ text: 'Producto eliminado.', type: 'success' });
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      categoria: '',
      color: '',
      talla: '',
      precio: '',
      stock: '',
      imagen: null,
      imagenPreview: ''
    });
    setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
  };

  const tallasDisponibles = actualizarTallas();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">Gestión de Productos</h2>
        <p className="text-[#7a5d68]">Registra ropa, calzado y accesorios</p>
      </div>
      
      {/* Formulario */}
      <div className="card mb-6">
        <h3 className="font-bold text-lg mb-4">
          {editandoId !== null ? 'Editar producto' : 'Registrar producto'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Nombre del producto</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej. Polo oversize"
            />
          </div>
          
          <div>
            <label className="block font-semibold mb-2">Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccione</option>
              <option>Ropa</option>
              <option>Calzado</option>
              <option>Accesorio</option>
            </select>
          </div>
          
          <div>
            <label className="block font-semibold mb-2">Color</label>
            <select name="color" value={formData.color} onChange={handleChange} className="input-field">
              <option value="">Seleccione un color</option>
              <option>Negro</option><option>Blanco</option><option>Rojo</option>
              <option>Azul</option><option>Verde</option><option>Rosado</option>
              <option>Gris</option><option>Marrón</option><option>Beige</option>
              <option>Amarillo</option>
            </select>
          </div>
          
          <div>
            <label className="block font-semibold mb-2">Talla</label>
            <select name="talla" value={formData.talla} onChange={handleChange} className="input-field">
              <option value="">Seleccione una talla</option>
              {tallasDisponibles.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block font-semibold mb-2">Precio</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej. 79.90"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block font-semibold mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej. 15"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Imagen del producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-field"
            />
            {formData.imagenPreview && (
              <img src={formData.imagenPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mt-3 border border-[#f1d7e1]" />
            )}
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button onClick={guardarProducto} className="btn-primary">
            {editandoId !== null ? 'Actualizar producto' : 'Guardar producto'}
          </button>
          {editandoId !== null && (
            <button onClick={limpiarFormulario} className="btn-secondary">
              Cancelar edición
            </button>
          )}
        </div>
        
        {mensaje.text && (
          <p className={`mt-3 font-semibold ${mensaje.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {mensaje.text}
          </p>
        )}
      </div>
      
      {/* Tabla de productos */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Listado de productos</h3>
          <span className="tag">Catálogo</span>
        </div>
        
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#fff4f8]">
            <tr>
              <th className="p-3 text-left">Imagen</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-left">Color</th>
              <th className="p-3 text-left">Talla</th>
              <th className="p-3 text-left">Precio</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b border-[#f1d7e1]">
                <td className="p-3">
                  <img src={producto.imagen} alt={producto.nombre} className="product-thumb" />
                </td>
                <td className="p-3 font-medium">{producto.nombre}</td>
                <td className="p-3">{producto.categoria}</td>
                <td className="p-3">{producto.color}</td>
                <td className="p-3">{producto.talla}</td>
                <td className="p-3">S/ {producto.precio.toFixed(2)}</td>
                <td className="p-3">{producto.stock}</td>
                <td className="p-3">
                  <span className={producto.estado === 'activo' ? 'tag tag-success' : 'tag tag-warning'}>
                    {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => editarProducto(producto)} className="btn-secondary text-sm py-1 px-3">
                      Editar
                    </button>
                    <button onClick={() => toggleEstadoProducto(producto.id)} className="btn-warning text-sm py-1 px-3">
                      {producto.estado === 'activo' ? 'Inactivar' : 'Activar'}
                    </button>
                    <button onClick={() => eliminarProducto(producto.id)} className="btn-danger text-sm py-1 px-3">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {productos.length === 0 && (
          <p className="text-center text-[#7a5d68] py-8">No hay productos registrados.</p>
        )}
      </div>
    </div>
  );
};

export default Productos;