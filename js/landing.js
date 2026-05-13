let carritoLanding = [];

function agregarCarritoLanding(nombre, precio) {
  carritoLanding.push({ nombre, precio });
  renderCarritoLanding();
}

function renderCarritoLanding() {
  const contenedor = document.getElementById("landingCartItems");

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
        <p>S/ ${item.precio.toFixed(2)}</p>
      </div>
      <button class="btn-secondary" onclick="eliminarItemLanding(${index})">Quitar</button>
    `;
    contenedor.appendChild(div);
  });

  actualizarTotalesLanding();
}

function eliminarItemLanding(index) {
  carritoLanding.splice(index, 1);
  renderCarritoLanding();
}

function actualizarTotalesLanding() {
  const subtotal = carritoLanding.reduce((acc, item) => acc + item.precio, 0);
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

  mensaje.textContent = "Compra simulada realizada correctamente.";
  mensaje.style.color = "green";
  carritoLanding = [];
  renderCarritoLanding();
}

function enviarMensaje() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  if (!nombre || !correo || !mensaje) {
    alert("Complete todos los campos.");
    return;
  }

  const mensajes = JSON.parse(localStorage.getItem("mensajesContacto")) || [];

  mensajes.push({
    nombre,
    correo,
    mensaje,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("mensajesContacto", JSON.stringify(mensajes));

  alert("Mensaje enviado correctamente.");

  document.getElementById("nombre").value = "";
  document.getElementById("correo").value = "";
  document.getElementById("mensaje").value = "";
}