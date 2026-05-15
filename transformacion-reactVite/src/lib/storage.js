// src/lib/storage.js
const STORAGE_KEYS = {
  USUARIOS: 'usuarios',
  PRODUCTOS: 'productos',
  VENTAS: 'ventas',
  PROVEEDORES: 'proveedores',
  ORDENES_COMPRA: 'ordenesCompra',
  MENSAJES_CONTACTO: 'mensajesContacto',
  CARRITO_LANDING: 'carritoLanding',
  SESION_ACTIVA: 'sesionActiva',
  USUARIO_ACTIVO: 'usuarioActivo',
  ROL_ACTIVO: 'rolActivo',
  LOGS_SISTEMA: 'logsSistema',
  RESPALDOS: 'respaldos',
  NOTIFICACIONES: 'notificaciones'
};

// Generic get/set
export const getStorage = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Usuarios
export const getUsuarios = () => getStorage(STORAGE_KEYS.USUARIOS, []);
export const setUsuarios = (data) => setStorage(STORAGE_KEYS.USUARIOS, data);

// Productos
export const getProductos = () => getStorage(STORAGE_KEYS.PRODUCTOS, []);
export const setProductos = (data) => setStorage(STORAGE_KEYS.PRODUCTOS, data);

// Ventas
export const getVentas = () => getStorage(STORAGE_KEYS.VENTAS, []);
export const setVentas = (data) => setStorage(STORAGE_KEYS.VENTAS, data);

// Proveedores
export const getProveedores = () => getStorage(STORAGE_KEYS.PROVEEDORES, []);
export const setProveedores = (data) => setStorage(STORAGE_KEYS.PROVEEDORES, data);

// Ordenes de Compra
export const getOrdenesCompra = () => getStorage(STORAGE_KEYS.ORDENES_COMPRA, []);
export const setOrdenesCompra = (data) => setStorage(STORAGE_KEYS.ORDENES_COMPRA, data);

// Mensajes de Contacto
export const getMensajesContacto = () => getStorage(STORAGE_KEYS.MENSAJES_CONTACTO, []);
export const setMensajesContacto = (data) => setStorage(STORAGE_KEYS.MENSAJES_CONTACTO, data);

// Carrito Landing (público)
export const getCarritoLanding = () => getStorage(STORAGE_KEYS.CARRITO_LANDING, []);
export const setCarritoLanding = (data) => setStorage(STORAGE_KEYS.CARRITO_LANDING, data);

// Logs del Sistema
export const getLogsSistema = () => getStorage(STORAGE_KEYS.LOGS_SISTEMA, []);
export const setLogsSistema = (data) => setStorage(STORAGE_KEYS.LOGS_SISTEMA, data);

export const addLog = (accion, usuario, detalles = '') => {
  const logs = getLogsSistema();
  const nuevoLog = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    fechaISO: new Date().toISOString(),
    accion,
    usuario,
    detalles
  };
  logs.unshift(nuevoLog);
  setLogsSistema(logs);
};

// Respaldos
export const getRespaldos = () => getStorage(STORAGE_KEYS.RESPALDOS, []);
export const setRespaldos = (data) => setStorage(STORAGE_KEYS.RESPALDOS, data);

// Notificaciones
export const getNotificaciones = () => getStorage(STORAGE_KEYS.NOTIFICACIONES, []);
export const setNotificaciones = (data) => setStorage(STORAGE_KEYS.NOTIFICACIONES, data);

export const addNotificacion = (titulo, mensaje, tipo = 'info', usuario = null) => {
  const notificaciones = getNotificaciones();
  const nuevaNotificacion = {
    id: Date.now(),
    titulo,
    mensaje,
    tipo, // 'success', 'error', 'warning', 'info'
    fecha: new Date().toLocaleString(),
    leido: false,
    usuario: usuario || 'todos'
  };
  notificaciones.unshift(nuevaNotificacion);
  setNotificaciones(notificaciones);
};

// Sesión
export const getSesionActiva = () => localStorage.getItem(STORAGE_KEYS.SESION_ACTIVA) === 'true';
export const setSesionActiva = (value) => localStorage.setItem(STORAGE_KEYS.SESION_ACTIVA, value);

export const getUsuarioActivo = () => localStorage.getItem(STORAGE_KEYS.USUARIO_ACTIVO) || '';
export const setUsuarioActivo = (value) => localStorage.setItem(STORAGE_KEYS.USUARIO_ACTIVO, value);

export const getRolActivo = () => localStorage.getItem(STORAGE_KEYS.ROL_ACTIVO) || '';
export const setRolActivo = (value) => localStorage.setItem(STORAGE_KEYS.ROL_ACTIVO, value);

// Logout
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
  localStorage.removeItem(STORAGE_KEYS.USUARIO_ACTIVO);
  localStorage.removeItem(STORAGE_KEYS.ROL_ACTIVO);
};

// Inicializar datos de ejemplo
export const initializeData = () => {
  // Usuarios iniciales con 5 roles
  if (getUsuarios().length === 0) {
    setUsuarios([
      { nombre: "Super Administrador", usuario: "superadmin", password: "123456", rol: "super_admin", email: "super@fashionstore.com", telefono: "999999991" },
      { nombre: "Administrador General", usuario: "admin", password: "123456", rol: "admin", email: "admin@fashionstore.com", telefono: "999999992" },
      { nombre: "Vendedor Principal", usuario: "vendedor", password: "123456", rol: "vendedor", email: "vendedor@fashionstore.com", telefono: "999999993" },
      { nombre: "Almacenero Jefe", usuario: "almacenero", password: "123456", rol: "almacenero", email: "almacen@fashionstore.com", telefono: "999999994" },
      { nombre: "Cliente Demo", usuario: "cliente", password: "123456", rol: "cliente", email: "cliente@fashionstore.com", telefono: "999999995" }
    ]);
  }
  
  // Productos de ejemplo
  if (getProductos().length === 0) {
    setProductos([
      {
        id: 1,
        nombre: "Polo Oversize",
        categoria: "Ropa",
        color: "Negro",
        talla: "M",
        precio: 59.90,
        stock: 15,
        stockMinimo: 5,
        proveedor: "Textil Peru S.A.",
        imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      },
      {
        id: 2,
        nombre: "Zapatillas Urban",
        categoria: "Calzado",
        color: "Blanco",
        talla: "40",
        precio: 219.00,
        stock: 10,
        stockMinimo: 3,
        proveedor: "Calzado Chic",
        imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      },
      {
        id: 3,
        nombre: "Bolso Casual",
        categoria: "Accesorio",
        color: "Marrón",
        talla: "Única",
        precio: 89.90,
        stock: 8,
        stockMinimo: 2,
        proveedor: "Accesorios Modernos",
        imagen: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      },
      {
        id: 4,
        nombre: "Casaca Denim",
        categoria: "Ropa",
        color: "Azul",
        talla: "L",
        precio: 159.90,
        stock: 5,
        stockMinimo: 3,
        proveedor: "Textil Peru S.A.",
        imagen: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      },
      {
        id: 5,
        nombre: "Gorra Deportiva",
        categoria: "Accesorio",
        color: "Rojo",
        talla: "Única",
        precio: 35.90,
        stock: 20,
        stockMinimo: 5,
        proveedor: "Accesorios Modernos",
        imagen: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      }
    ]);
  }
  
  // Ventas de ejemplo
  if (getVentas().length === 0) {
    setVentas([]);
  }
  
  // Proveedores de ejemplo
  if (getProveedores().length === 0) {
    setProveedores([
      { id: 1, nombre: "Textil Peru S.A.", contacto: "Juan Pérez", telefono: "987654321", email: "ventas@textilperu.com", direccion: "Lima, Perú" },
      { id: 2, nombre: "Calzado Chic", contacto: "María García", telefono: "987654322", email: "info@calzadochic.com", direccion: "Arequipa, Perú" },
      { id: 3, nombre: "Accesorios Modernos", contacto: "Carlos López", telefono: "987654323", email: "ventas@accesoriosmodernos.com", direccion: "Cusco, Perú" }
    ]);
  }
  
  // Ordenes de compra de ejemplo
  if (getOrdenesCompra().length === 0) {
    setOrdenesCompra([]);
  }
  
  // Mensajes de contacto de ejemplo
  if (getMensajesContacto().length === 0) {
    setMensajesContacto([]);
  }
  
  // Carrito de ejemplo
  if (getCarritoLanding().length === 0) {
    setCarritoLanding([]);
  }

  // Logs de ejemplo
  if (getLogsSistema().length === 0) {
    addLog("Sistema inicializado", "system", "Se creó la base de datos inicial");
  }
};



// Nuevas claves de almacenamiento
const STORAGE_KEYS_EXTRA = {
  CUPONES: 'cupones',
  WISHLIST: 'wishlist',
  RESENAS: 'resenas',
  CHAT_MENSAJES: 'chatMensajes',
  SUSCRIPCIONES: 'suscripciones',
  NOTIFICACIONES_USUARIO: 'notificacionesUsuario'
};



// Cupones
export const getCupones = () => getStorage(STORAGE_KEYS_EXTRA.CUPONES, []);
export const setCupones = (data) => setStorage(STORAGE_KEYS_EXTRA.CUPONES, data);

// Wishlist
export const getWishlist = () => getStorage(STORAGE_KEYS_EXTRA.WISHLIST, []);
export const setWishlist = (data) => setStorage(STORAGE_KEYS_EXTRA.WISHLIST, data);
