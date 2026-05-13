let carritoLanding = [];

function cargarCarritoLanding() {
  carritoLanding = JSON.parse(localStorage.getItem("carritoLanding")) || [];
}

function guardarCarritoLanding() {
  localStorage.setItem("carritoLanding", JSON.stringify(carritoLanding));
}

function renderCarritoLanding() {
  const contenedor = document.getElementById("landingCartItems");

  if (!contenedor) return;

  if (carritoLanding.length === 0) {
    contenedor.innerHTML = `<p class="empty-text">No hay productos agregados al carrito.</p>`;
    actualizarTotalesLanding();
    return;
  }

  contenedor.innerHTML = "";

  carritoLanding.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "landing-cart-item";

    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <p>Color: ${item.color} | Talla: ${item.talla}</p>
        <p>Cantidad: ${item.cantidad}</p>
        <p>S/ ${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
      <button class="btn-secondary" onclick="eliminarItemLanding(${index})">Quitar</button>
    `;

    contenedor.appendChild(div);
  });

  actualizarTotalesLanding();
}

function eliminarItemLanding(index) {
  carritoLanding.splice(index, 1);
  guardarCarritoLanding();
  renderCarritoLanding();
}

function actualizarTotalesLanding() {
  const subtotal = carritoLanding.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  document.getElementById("landingSubtotal").textContent = subtotal.toFixed(2);
  document.getElementById("landingIgv").textContent = igv.toFixed(2);
  document.getElementById("landingTotal").textContent = total.toFixed(2);
}

function finalizarCompraLanding() {
  const mensaje = document.getElementById("landingMessage");

  if (carritoLanding.length === 0) {
    mensaje.textContent = "Agrega al menos un producto para finalizar la compra.";
    mensaje.style.color = "red";
    return;
  }

  const sesionActiva = localStorage.getItem("sesionActiva");
  const rolActivo = localStorage.getItem("rolActivo");

  if (sesionActiva !== "true" || rolActivo !== "cliente") {
    localStorage.setItem("redirectAfterLogin", "carrito.html");
    mensaje.textContent = "Debe iniciar sesión o crear una cuenta para solicitar la compra.";
    mensaje.style.color = "red";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

    return;
  }

  registrarCompraCliente();
}

function registrarCompraCliente() {
  const mensaje = document.getElementById("landingMessage");

  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  for (const item of carritoLanding) {
    const producto = productos.find(p => p.id === item.id);

    if (!producto || producto.stock < item.cantidad) {
      mensaje.textContent = `Stock insuficiente para ${item.nombre}.`;
      mensaje.style.color = "red";
      return;
    }
  }

  carritoLanding.forEach(item => {
    const producto = productos.find(p => p.id === item.id);

    if (producto) {
      producto.stock -= item.cantidad;
    }
  });

  const subtotal = carritoLanding.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const nuevaVenta = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    fechaISO: new Date().toISOString(),
    cliente: localStorage.getItem("usuarioActivo"),
    origen: "ecommerce",
    items: [...carritoLanding],
    subtotal,
    igv,
    total,
    metodoPago: "Solicitud online",
    estado: "pendiente"
  };

  ventas.unshift(nuevaVenta);

  localStorage.setItem("ventas", JSON.stringify(ventas));
  localStorage.setItem("productos", JSON.stringify(productos));

  carritoLanding = [];
  guardarCarritoLanding();
  renderCarritoLanding();

  mensaje.textContent = "Solicitud de compra registrada correctamente.";
  mensaje.style.color = "green";
}

window.onload = function () {
  cargarCarritoLanding();
  renderCarritoLanding();
};