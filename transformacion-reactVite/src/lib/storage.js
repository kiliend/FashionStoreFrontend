// src/lib/storage.js
// MEJORA 1-15: Sistema de storage completo con validaciones

const STORAGE_KEYS = {
  PRODUCTOS: 'productos',
  VENTAS: 'ventas',
  USUARIOS: 'usuarios',
  CARRITO_LANDING: 'carritoLanding',
  MENSAJES_CONTACTO: 'mensajesContacto',
  WISHLIST: 'wishlist',
  RESENAS: 'resenas',
  LOGS: 'logs',
  CUPONES: 'cupones',
  BLOG_POSTS: 'blogPosts',
  FAQ: 'faq',
  NEWSLETTER: 'newsletter',
  BACKUP: 'backup'
};

// MEJORA 1: Función de inicialización con datos por defecto
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTOS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify([
      { id: 1, nombre: 'Camisa Blanca', categoria: 'Ropa', color: 'Blanco', talla: 'M', precio: 79.90, stock: 50, imagen: '/images/camisa-blanca.jpg', estado: 'activo' },
      { id: 2, nombre: 'Jeans Azul', categoria: 'Ropa', color: 'Azul', talla: '32', precio: 129.90, stock: 30, imagen: '/images/jeans-azul.jpg', estado: 'activo' },
      { id: 3, nombre: 'Zapatillas Running', categoria: 'Calzado', color: 'Negro', talla: '40', precio: 199.90, stock: 20, imagen: '/images/zapatillas.jpg', estado: 'activo' },
      { id: 4, nombre: 'Bolso Casual', categoria: 'Accesorio', color: 'Marrón', talla: 'Única', precio: 89.90, stock: 15, imagen: '/images/bolso.jpg', estado: 'activo' }
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify([
      { id: 1, nombre: 'Admin', username: 'admin', password: '123456', email: 'admin@fashionstore.com', rol: 'super_admin', fechaRegistro: new Date().toISOString() }
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.VENTAS)) {
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CARRITO_LANDING)) {
    localStorage.setItem(STORAGE_KEYS.CARRITO_LANDING, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MENSAJES_CONTACTO)) {
    localStorage.setItem(STORAGE_KEYS.MENSAJES_CONTACTO, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RESENAS)) {
    localStorage.setItem(STORAGE_KEYS.RESENAS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CUPONES)) {
    localStorage.setItem(STORAGE_KEYS.CUPONES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)) {
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FAQ)) {
    localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NEWSLETTER)) {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify([]));
  }
};

// MEJORA 2: Función de backup automático
export const createBackup = () => {
  const backup = {};
  Object.keys(STORAGE_KEYS).forEach(key => {
    backup[key] = localStorage.getItem(STORAGE_KEYS[key]);
  });
  backup.timestamp = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
  addLog('Backup automático creado', 'system', 'Backup completo');
  return backup;
};

// MEJORA 3: Función para restaurar backup
export const restoreBackup = (backupData) => {
  if (!backupData) return false;
  Object.keys(STORAGE_KEYS).forEach(key => {
    if (backupData[key]) {
      localStorage.setItem(STORAGE_KEYS[key], backupData[key]);
    }
  });
  addLog('Backup restaurado', 'system', 'Recuperación de datos');
  return true;
};

// MEJORA 4: Funciones de Productos con validación
export const getProductos = () => {
  try {
    const productos = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
    return productos ? JSON.parse(productos) : [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

export const setProductos = (productos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar productos:', error);
    return false;
  }
};

// MEJORA 5: Funciones de Ventas con validación
export const getVentas = () => {
  try {
    const ventas = localStorage.getItem(STORAGE_KEYS.VENTAS);
    return ventas ? JSON.parse(ventas) : [];
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return [];
  }
};

export const setVentas = (ventas) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar ventas:', error);
    return false;
  }
};

// MEJORA 6: Funciones de Carrito
export const getCarritoLanding = () => {
  try {
    const carrito = localStorage.getItem(STORAGE_KEYS.CARRITO_LANDING);
    return carrito ? JSON.parse(carrito) : [];
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return [];
  }
};

export const setCarritoLanding = (carrito) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARRITO_LANDING, JSON.stringify(carrito));
    return true;
  } catch (error) {
    console.error('Error al guardar carrito:', error);
    return false;
  }
};

// MEJORA 7: Funciones de Mensajes
export const getMensajesContacto = () => {
  try {
    const mensajes = localStorage.getItem(STORAGE_KEYS.MENSAJES_CONTACTO);
    return mensajes ? JSON.parse(mensajes) : [];
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return [];
  }
};

export const setMensajesContacto = (mensajes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MENSAJES_CONTACTO, JSON.stringify(mensajes));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar mensajes:', error);
    return false;
  }
};

// MEJORA 8: Funciones de Wishlist
export const getWishlist = () => {
  try {
    const wishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error al obtener wishlist:', error);
    return [];
  }
};

export const setWishlist = (wishlist) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return true;
  } catch (error) {
    console.error('Error al guardar wishlist:', error);
    return false;
  }
};

// MEJORA 9: Funciones de Reseñas
export const getResenas = () => {
  try {
    const resenas = localStorage.getItem(STORAGE_KEYS.RESENAS);
    return resenas ? JSON.parse(resenas) : [];
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return [];
  }
};

export const setResenas = (resenas) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESENAS, JSON.stringify(resenas));
    return true;
  } catch (error) {
    console.error('Error al guardar reseñas:', error);
    return false;
  }
};

// MEJORA 10: Función de Logs con nivel
export const addLog = (accion, usuario, detalles = '', nivel = 'info') => {
  try {
    const logs = getLogs();
    const nuevoLog = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      fechaLocal: new Date().toLocaleString(),
      accion,
      usuario,
      detalles,
      nivel, // 'info', 'warning', 'error'
      ip: 'cliente'
    };
    logs.unshift(nuevoLog);
    if (logs.length > 1000) logs.pop(); // Limitar logs
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return true;
  } catch (error) {
    console.error('Error al agregar log:', error);
    return false;
  }
};

export const getLogs = () => {
  try {
    const logs = localStorage.getItem(STORAGE_KEYS.LOGS);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return [];
  }
};

// MEJORA 11: Funciones de Cupones
export const getCupones = () => {
  try {
    const cupones = localStorage.getItem(STORAGE_KEYS.CUPONES);
    return cupones ? JSON.parse(cupones) : [];
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return [];
  }
};

export const setCupones = (cupones) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUPONES, JSON.stringify(cupones));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar cupones:', error);
    return false;
  }
};

// MEJORA 12: Funciones de Blog
export const getBlogPosts = () => {
  try {
    const posts = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.error('Error al obtener blog posts:', error);
    return [];
  }
};

export const setBlogPosts = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(posts));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar blog posts:', error);
    return false;
  }
};

// MEJORA 13: Funciones de FAQ
export const getFaq = () => {
  try {
    const faq = localStorage.getItem(STORAGE_KEYS.FAQ);
    return faq ? JSON.parse(faq) : [];
  } catch (error) {
    console.error('Error al obtener FAQ:', error);
    return [];
  }
};

export const setFaq = (faq) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify(faq));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar FAQ:', error);
    return false;
  }
};
// Sistema de almacenamiento local para FashionStore
// ============ INICIALIZACIÓN DE DATOS ============
  const initializeData = () => {
    // Usuarios
    if (!localStorage.getItem('usuarios')) {
      const usuariosIniciales = [
        { nombre: 'Administrador', usuario: 'admin', password: '123456', email: 'admin@fashionstore.com', telefono: '', rol: 'super_admin' },
        { nombre: 'Vendedor Demo', usuario: 'vendedor', password: '123456', email: 'vendedor@fashionstore.com', telefono: '', rol: 'vendedor' },
        { nombre: 'Almacenero Demo', usuario: 'almacenero', password: '123456', email: 'almacen@fashionstore.com', telefono: '', rol: 'almacenero' },
        { nombre: 'Cliente Demo', usuario: 'cliente', password: '123456', email: 'cliente@fashionstore.com', telefono: '999888777', rol: 'cliente' }
      ];
      localStorage.setItem('usuarios', JSON.stringify(usuariosIniciales));
    }
    // Productos
    if (!localStorage.getItem('productos')) {
      const productosIniciales = [
        { id: 1, nombre: 'Polo Básico Algodón', categoria: 'Ropa', color: 'Blanco', talla: 'M', precio: 49.90, stock: 25, stockMinimo: 5, proveedor: 'TextilPerú', imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', estado: 'activo' },
        { id: 2, nombre: 'Jeans Skinny Azul', categoria: 'Ropa', color: 'Azul', talla: '32', precio: 89.90, stock: 15, stockMinimo: 5, proveedor: 'DenimCo', imagen: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', estado: 'activo' },
        { id: 3, nombre: 'Zapatillas Deportivas', categoria: 'Calzado', color: 'Negro', talla: '42', precio: 159.90, stock: 8, stockMinimo: 3, proveedor: 'SportGear', imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', estado: 'activo' },
        { id: 4, nombre: 'Bolso Casual', categoria: 'Accesorio', color: 'Marrón', talla: 'Única', precio: 69.90, stock: 12, stockMinimo: 5, proveedor: 'AccesoriosPerú', imagen: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', estado: 'activo' }
      ];
      localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }
    // Ventas
    if (!localStorage.getItem('ventas')) {
      localStorage.setItem('ventas', JSON.stringify([]));
    }
  // Proveedores
    if (!localStorage.getItem('proveedores')) {
      const proveedoresIniciales = [
        { id: 1, nombre: 'TextilPerú', contacto: 'Juan Pérez', telefono: '987654321', email: 'ventas@textilperu.com', direccion: 'Lima - Perú' },
        { id: 2, nombre: 'DenimCo', contacto: 'María Gómez', telefono: '987654322', email: 'contacto@denimco.com', direccion: 'Arequipa - Perú' }
      ];
      localStorage.setItem('proveedores', JSON.stringify(proveedoresIniciales));
    }
    // Órdenes de Compra
    if (!localStorage.getItem('ordenesCompra')) {
      localStorage.setItem('ordenesCompra', JSON.stringify([]));
    }
      // Mensajes de Contacto
    if (!localStorage.getItem('mensajesContacto')) {
      localStorage.setItem('mensajesContacto', JSON.stringify([]));
    }
    // Logs del Sistema
    if (!localStorage.getItem('logsSistema')) {
      localStorage.setItem('logsSistema', JSON.stringify([]));
    }
    // Respaldos
    if (!localStorage.getItem('respaldos')) {
      localStorage.setItem('respaldos', JSON.stringify([]));
    }
    // Cupones
    if (!localStorage.getItem('cupones')) {
      const cuponesIniciales = [
        { id: 1, codigo: 'BIENVENIDA10', descuento: 10, tipo: 'porcentaje', validoHasta: '2025-12-31', minCompra: 50, usado: false },
        { id: 2, codigo: 'DESCUENTO20', descuento: 20, tipo: 'porcentaje', validoHasta: '2025-12-31', minCompra: 100, usado: false }
      ];
      localStorage.setItem('cupones', JSON.stringify(cuponesIniciales));
    }

    // Blog Posts
    if (!localStorage.getItem('blogPosts')) {
      const blogInicial = [
        { id: 1, titulo: 'Tendencias de Moda 2026', resumen: 'Descubre las tendencias que marcarán el año', contenido: 'Contenido completo del artículo...', categoria: 'Tendencias', imagen: 'https://images.unsplash.com/photo-1445205170230-053b83016050', autor: 'Admin', fecha: '2024-01-15' }
      ];
      localStorage.setItem('blogPosts', JSON.stringify(blogInicial));
    }

    // FAQ
    if (!localStorage.getItem('faq')) {
      const faqInicial = [
        { id: 1, pregunta: '¿Cómo puedo hacer un pedido?', respuesta: 'Puedes navegar por el catálogo, agregar productos al carrito y finalizar la compra.', categoria: 'Compras' },
        { id: 2, pregunta: '¿Cuánto tiempo tarda el envío?', respuesta: 'Los envíos a Lima toman 2-3 días hábiles, provincias 5-7 días.', categoria: 'Envíos' }
      ];
      localStorage.setItem('faq', JSON.stringify(faqInicial));
    }

    // Suscripciones Newsletter
    if (!localStorage.getItem('suscripciones')) {
      localStorage.setItem('suscripciones', JSON.stringify([]));
    }

    // Wishlist
    if (!localStorage.getItem('wishlist')) {
      localStorage.setItem('wishlist', JSON.stringify([]));
    }
    // Reseñas de Productos
    if (!localStorage.getItem('resenas')) {
      localStorage.setItem('resenas', JSON.stringify([]));
    }
    // Carrito Landing
    if (!localStorage.getItem('carritoLanding')) {
      localStorage.setItem('carritoLanding', JSON.stringify([]));
    }
  };
  initializeData();

    // ============ FUNCIONES GENERICAS ============
  const getItem = (key) => JSON.parse(localStorage.getItem(key)) || [];
  const setItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    // ============ USUARIOS ============
  export const getUsuarios = () => getItem('usuarios');
  export const setUsuarios = (data) => setItem('usuarios', data);

  // ============ PRODUCTOS ============
  export const getProductos = () => getItem('productos');
  export const setProductos = (data) => setItem('productos', data);

    // ============ VENTAS ============
  export const getVentas = () => getItem('ventas');
  export const setVentas = (data) => setItem('ventas', data);

    // ============ PROVEEDORES ============
  export const getProveedores = () => getItem('proveedores');
  export const setProveedores = (data) => setItem('proveedores', data);

  // ============ ÓRDENES DE COMPRA ============
  export const getOrdenesCompra = () => getItem('ordenesCompra');
  export const setOrdenesCompra = (data) => setItem('ordenesCompra', data);

    // ============ MENSAJES CONTACTO ============
  export const getMensajesContacto = () => getItem('mensajesContacto');
  export const setMensajesContacto = (data) => setItem('mensajesContacto', data);

  // ============ LOGS SISTEMA ============
  export const getLogsSistema = () => getItem('logsSistema');
  export const setLogsSistema = (data) => setItem('logsSistema', data);

  export const addLog = (accion, usuario, detalles = '') => {
    const logs = getLogsSistema();
    const nuevoLog = {
      id: Date.now(),
      accion,
      usuario,
      detalles,
      fecha: new Date().toLocaleString()
    };
    setLogsSistema([nuevoLog, ...logs.slice(0, 199)]);
  };

    // ============ RESPALDOS ============
  export const getRespaldos = () => getItem('respaldos');
  export const setRespaldos = (data) => setItem('respaldos', data);

    // ============ CUPONES ============
  export const getCupones = () => getItem('cupones');
  export const setCupones = (data) => setItem('cupones', data);




// MEJORA 14: Funciones de Newsletter
export const getNewsletter = () => {
  try {
    const newsletter = localStorage.getItem(STORAGE_KEYS.NEWSLETTER);
    return newsletter ? JSON.parse(newsletter) : [];
  } catch (error) {
    console.error('Error al obtener newsletter:', error);
    return [];
  }
};

export const setNewsletter = (suscriptores) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(suscriptores));
    createBackup();
    return true;
  } catch (error) {
    console.error('Error al guardar newsletter:', error);
    return false;
  }
};

// MEJORA 15: Función de limpieza de datos
export const clearAllData = () => {
  try {
    Object.keys(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(STORAGE_KEYS[key]);
    });
    initializeStorage();
    addLog('Todos los datos fueron limpiados', 'system', 'Reset completo');
    return true;
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    return false;
  }
};

// Inicializar al cargar
initializeStorage();