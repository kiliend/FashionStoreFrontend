let productosCatalogo = [];

function cargarProductosCatalogo() {
  const productosGuardados = localStorage.getItem("productos");
  productosCatalogo = productosGuardados ? JSON.parse(productosGuardados) : [];
}

function renderCatalogo(lista = productosCatalogo) {
  const contenedor = document.getElementById("catalogoContainer");
  if (!contenedor) return;

  const productosActivos = lista.filter(producto => producto.estado === "activo");

  if (productosActivos.length === 0) {
    contenedor.innerHTML = `<p class="empty-text">No hay productos disponibles.</p>`;
    return;
  }

  contenedor.innerHTML = "";

  productosActivos.forEach(producto => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="product-info">
        <span class="product-category">${producto.categoria}</span>
        <h3>${producto.nombre}</h3>
        <p>Color: ${producto.color}</p>
        <p>Talla: ${producto.talla}</p>
        <p>Stock disponible: ${producto.stock}</p>
        <p class="product-price">S/ ${producto.precio.toFixed(2)}</p>
        <button class="btn-primary full-btn" onclick="agregarCarritoCatalogo(${producto.id})">
          Agregar al carrito
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function filtrarCatalogo() {
  const categoria = document.getElementById("filtroCategoria").value;
  const color = document.getElementById("filtroColor").value;
  const talla = document.getElementById("filtroTalla").value;

  const filtrados = productosCatalogo.filter(producto => {
    return (
      (categoria === "" || producto.categoria === categoria) &&
      (color === "" || producto.color === color) &&
      (talla === "" || producto.talla === talla)
    );
  });

  renderCatalogo(filtrados);
}

function agregarCarritoCatalogo(productoId) {
  const carrito = JSON.parse(localStorage.getItem("carritoLanding")) || [];
  const producto = productosCatalogo.find(p => p.id === productoId && p.estado === "activo");

  if (!producto) return;

  const existente = carrito.find(item => item.id === producto.id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      color: producto.color,
      talla: producto.talla,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen
    });
  }

  localStorage.setItem("carritoLanding", JSON.stringify(carrito));
  alert("Producto agregado al carrito.");
}

window.onload = function () {
  cargarProductosCatalogo();
  renderCatalogo();
};