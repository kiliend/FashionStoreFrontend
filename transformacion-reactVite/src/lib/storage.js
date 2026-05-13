// Storage keys
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
  ROL_ACTIVO: 'rolActivo'
};

// Generic get/set
export const getStorage = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific methods
export const getUsuarios = () => getStorage(STORAGE_KEYS.USUARIOS, []);
export const setUsuarios = (data) => setStorage(STORAGE_KEYS.USUARIOS, data);

export const getProductos = () => getStorage(STORAGE_KEYS.PRODUCTOS, []);
export const setProductos = (data) => setStorage(STORAGE_KEYS.PRODUCTOS, data);

export const getVentas = () => getStorage(STORAGE_KEYS.VENTAS, []);
export const setVentas = (data) => setStorage(STORAGE_KEYS.VENTAS, data);

export const getProveedores = () => getStorage(STORAGE_KEYS.PROVEEDORES, []);
export const setProveedores = (data) => setStorage(STORAGE_KEYS.PROVEEDORES, data);

export const getOrdenesCompra = () => getStorage(STORAGE_KEYS.ORDENES_COMPRA, []);
export const setOrdenesCompra = (data) => setStorage(STORAGE_KEYS.ORDENES_COMPRA, data);

export const getMensajesContacto = () => getStorage(STORAGE_KEYS.MENSAJES_CONTACTO, []);
export const setMensajesContacto = (data) => setStorage(STORAGE_KEYS.MENSAJES_CONTACTO, data);

export const getCarritoLanding = () => getStorage(STORAGE_KEYS.CARRITO_LANDING, []);
export const setCarritoLanding = (data) => setStorage(STORAGE_KEYS.CARRITO_LANDING, data);

export const getSesionActiva = () => localStorage.getItem(STORAGE_KEYS.SESION_ACTIVA) === 'true';
export const setSesionActiva = (value) => localStorage.setItem(STORAGE_KEYS.SESION_ACTIVA, value);

export const getUsuarioActivo = () => localStorage.getItem(STORAGE_KEYS.USUARIO_ACTIVO) || '';
export const setUsuarioActivo = (value) => localStorage.setItem(STORAGE_KEYS.USUARIO_ACTIVO, value);

export const getRolActivo = () => localStorage.getItem(STORAGE_KEYS.ROL_ACTIVO) || '';
export const setRolActivo = (value) => localStorage.setItem(STORAGE_KEYS.ROL_ACTIVO, value);

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
  localStorage.removeItem(STORAGE_KEYS.USUARIO_ACTIVO);
  localStorage.removeItem(STORAGE_KEYS.ROL_ACTIVO);
};

// Initialize default data
export const initializeData = () => {
  // Usuarios
  if (getUsuarios().length === 0) {
    setUsuarios([
      { nombre: "Administrador General", usuario: "admin", password: "123456", rol: "admin" }
    ]);
  }
  
  // Productos demo
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
        imagen: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
        estado: "activo"
      }
    ]);
  }
};