function guardarProveedores() {
  localStorage.setItem("proveedores", JSON.stringify(proveedores));
}

function cargarProveedores() {
  proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
}

function guardarOrdenesCompra() {
  localStorage.setItem("ordenesCompra", JSON.stringify(ordenesCompra));
}

function cargarOrdenesCompra() {
  ordenesCompra = JSON.parse(localStorage.getItem("ordenesCompra")) || [];
}

function registrarProveedor() {
  const nombre = document.getElementById("proveedorNombre").value.trim();
  const ruc = document.getElementById("proveedorRuc").value.trim();
  const telefono = document.getElementById("proveedorTelefono").value.trim();
  const correo = document.getElementById("proveedorCorreo").value.trim();
  const mensaje = document.getElementById("mensajeProveedor");

  if (!nombre || !ruc || !telefono || !correo) {
    mensaje.textContent = "Complete todos los campos del proveedor.";
    mensaje.style.color = "red";
    return;
  }

  proveedores.push({
    id: Date.now(),
    nombre,
    ruc,
    telefono,
    correo,
    estado: "activo"
  });

  guardarProveedores();
  renderProveedores();
  cargarSelectProveedores();
  renderIndicadoresProveedores();

  mensaje.textContent = "Proveedor registrado correctamente.";
  mensaje.style.color = "green";

  document.getElementById("proveedorNombre").value = "";
  document.getElementById("proveedorRuc").value = "";
  document.getElementById("proveedorTelefono").value = "";
  document.getElementById("proveedorCorreo").value = "";
}

function renderProveedores() {
  const tbody = document.querySelector("#tablaProveedores tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (proveedores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#7a5d68;">
          No hay proveedores registrados.
        </td>
      </tr>
    `;
    return;
  }

  proveedores.forEach((proveedor, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${proveedor.nombre}</td>
      <td>${proveedor.ruc}</td>
      <td>${proveedor.telefono}</td>
      <td>${proveedor.correo}</td>
      <td>
        <button class="btn-danger" onclick="eliminarProveedor(${index})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(fila);
  });
}

function eliminarProveedor(index) {
  const confirmar = confirm("¿Desea eliminar este proveedor?");

  if (!confirmar) return;

  proveedores.splice(index, 1);
  guardarProveedores();
  renderProveedores();
  cargarSelectProveedores();
  renderIndicadoresProveedores();
}

function cargarSelectProveedores() {
  const select = document.getElementById("ordenProveedor");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccione proveedor</option>`;

  proveedores.forEach(proveedor => {
    const option = document.createElement("option");
    option.value = proveedor.id;
    option.textContent = proveedor.nombre;
    select.appendChild(option);
  });
}

function agregarProductoOrdenCompra() {
  const producto = document.getElementById("ordenProducto").value.trim();
  const cantidad = Number(document.getElementById("ordenCantidad").value);
  const costoUnitario = Number(document.getElementById("ordenCostoUnitario").value);
  const mensaje = document.getElementById("mensajeOrdenCompra");

  if (!producto || cantidad <= 0 || costoUnitario <= 0) {
    mensaje.textContent = "Complete producto, cantidad y costo unitario.";
    mensaje.style.color = "red";
    return;
  }

  ordenCompraItems.push({
    producto,
    cantidad,
    costoUnitario,
    subtotal: cantidad * costoUnitario
  });

  document.getElementById("ordenProducto").value = "";
  document.getElementById("ordenCantidad").value = "";
  document.getElementById("ordenCostoUnitario").value = "";

  mensaje.textContent = "Producto agregado a la orden.";
  mensaje.style.color = "green";

  renderOrdenCompraItems();
}

function renderOrdenCompraItems() {
  const contenedor = document.getElementById("ordenCompraItems");
  const totalSpan = document.getElementById("ordenCompraTotal");

  if (!contenedor || !totalSpan) return;

  if (ordenCompraItems.length === 0) {
    contenedor.innerHTML = `<p class="empty-cart">No hay productos agregados a la orden.</p>`;
    totalSpan.textContent = "0.00";
    return;
  }

  contenedor.innerHTML = "";

  ordenCompraItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div>
        <strong>${item.producto}</strong>
        <p>Cantidad: ${item.cantidad}</p>
        <p>Costo unitario: S/ ${item.costoUnitario.toFixed(2)}</p>
        <p>Subtotal: S/ ${item.subtotal.toFixed(2)}</p>
      </div>
      <button class="btn-secondary" onclick="eliminarProductoOrdenCompra(${index})">
        Quitar
      </button>
    `;

    contenedor.appendChild(div);
  });

  const total = ordenCompraItems.reduce((acc, item) => acc + item.subtotal, 0);
  totalSpan.textContent = total.toFixed(2);
}

function eliminarProductoOrdenCompra(index) {
  ordenCompraItems.splice(index, 1);
  renderOrdenCompraItems();
}

function renderOrdenesCompra() {
  const tbody = document.querySelector("#tablaOrdenesCompra tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (ordenesCompra.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#7a5d68;">
          No hay órdenes de compra registradas.
        </td>
      </tr>
    `;
    return;
  }

  ordenesCompra.forEach((orden, index) => {
    const estadoFactura = orden.facturaEstado === "pagada"
      ? `<span class="tag success">Pagada</span>`
      : `<span class="tag warning">Pendiente</span>`;

    const accionFactura = orden.facturaEstado === "pendiente"
      ? `<button class="btn-primary" onclick="pagarFactura(${index})">Pagar</button>`
      : `<span style="color:#64748b;">Sin acciones</span>`;

    let productosTexto = "Sin productos";

    if (orden.items && Array.isArray(orden.items)) {
      productosTexto = orden.items.map(item => `
        ${item.producto} (${item.cantidad} und. x S/ ${item.costoUnitario.toFixed(2)})
      `).join("<br>");
    }

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${orden.id}</td>
      <td>${orden.proveedorNombre}</td>
      <td>${productosTexto}</td>
      <td>S/ ${orden.total.toFixed(2)}</td>
      <td>${estadoFactura}<br>${accionFactura}</td>
    `;

    tbody.appendChild(fila);
  });
}

function pagarFactura(index) {
  ordenesCompra[index].facturaEstado = "pagada";
  ordenesCompra[index].fechaPago = new Date().toLocaleString();

  guardarOrdenesCompra();
  renderOrdenesCompra();
  renderIndicadoresProveedores();
}

function renderIndicadoresProveedores() {
  const totalProveedores = document.getElementById("totalProveedores");
  const totalOrdenesCompra = document.getElementById("totalOrdenesCompra");
  const facturasPendientes = document.getElementById("facturasPendientes");
  const alertasStockProveedor = document.getElementById("alertasStockProveedor");

  if (!totalProveedores) return;

  const stockBajo = productos.filter(producto =>
    producto.estado === "activo" && producto.stock <= 5
  ).length;

  totalProveedores.textContent = proveedores.length;
  totalOrdenesCompra.textContent = ordenesCompra.length;
  facturasPendientes.textContent = ordenesCompra.filter(o => o.facturaEstado === "pendiente").length;
  alertasStockProveedor.textContent = stockBajo;
}


function registrarOrdenCompra() {
  const proveedorId = document.getElementById("ordenProveedor").value;
  const mensaje = document.getElementById("mensajeOrdenCompra");

  if (!proveedorId) {
    mensaje.textContent = "Seleccione un proveedor.";
    mensaje.style.color = "red";
    return;
  }

  if (ordenCompraItems.length === 0) {
    mensaje.textContent = "Agregue al menos un producto a la orden.";
    mensaje.style.color = "red";
    return;
  }

  const proveedor = proveedores.find(p => p.id == proveedorId);

  const total = ordenCompraItems.reduce((acc, item) => acc + item.subtotal, 0);

  ordenesCompra.push({
    id: Date.now(),
    proveedorId,
    proveedorNombre: proveedor.nombre,
    fecha: new Date().toLocaleString(),
    items: [...ordenCompraItems],
    total,
    facturaEstado: "pendiente"
  });

  guardarOrdenesCompra();
  renderOrdenesCompra();
  renderIndicadoresProveedores();

  ordenCompraItems = [];
  renderOrdenCompraItems();

  document.getElementById("ordenProveedor").value = "";

  mensaje.textContent = "Orden de compra registrada correctamente.";
  mensaje.style.color = "green";
}