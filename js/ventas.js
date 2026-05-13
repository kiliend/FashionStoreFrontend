
// CARRITO
function agregarAlCarrito(productoId) {
  const producto = productos.find(p => p.id === productoId);

  if (!producto) return;

  if (producto.stock <= 0) {
    alert("No hay stock disponible para esta variante.");
    return;
  }

  const itemExistente = cart.find(item => item.id === productoId);

  if (itemExistente) {
    if (itemExistente.cantidad < producto.stock) {
      itemExistente.cantidad += 1;
    } else {
      alert("No puede agregar más unidades que el stock disponible.");
    }
  } else {
    cart.push({
      id: producto.id,
      nombre: producto.nombre,
      color: producto.color,
      talla: producto.talla,
      precio: producto.precio,
      cantidad: 1
    });
  }

  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById("cart");

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-cart">No hay productos agregados.</p>`;
    actualizarTotales();
    return;
  }

  cartContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <p>Color: ${item.color} | Talla: ${item.talla}</p>
        <p>Cantidad: ${item.cantidad}</p>
        <p>S/ ${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
      <button class="btn-secondary" onclick="eliminarDelCarrito(${index})">Quitar</button>
    `;
    cartContainer.appendChild(div);
  });

  actualizarTotales();
}

function eliminarDelCarrito(index) {
  cart.splice(index, 1);
  renderCart();
}

function actualizarTotales() {
  const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("igv").textContent = igv.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function confirmarVenta() {
  const metodoPago = document.getElementById("pago").value;
  const mensaje = document.getElementById("mensajeVenta");

  if (cart.length === 0) {
    mensaje.textContent = "Debe agregar al menos un producto al carrito.";
    mensaje.style.color = "red";
    return;
  }

  if (!metodoPago) {
    mensaje.textContent = "Seleccione un método de pago.";
    mensaje.style.color = "red";
    return;
  }

  for (const item of cart) {
    const producto = productos.find(p => p.id === item.id);

    if (!producto || producto.stock < item.cantidad) {
      mensaje.textContent = `Stock insuficiente para ${item.nombre} - ${item.color} - ${item.talla}.`;
      mensaje.style.color = "red";
      return;
    }
  }

  cart.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
      producto.stock -= item.cantidad;
    }
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const nuevaVenta = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    fechaISO: new Date().toISOString(),
    vendedor: localStorage.getItem("usuarioActivo") || "No asignado",
    origen: "presencial",
    items: [...cart],
    subtotal,
    igv,
    total,
    metodoPago,
    estado: "completada"
  };

  ventas.unshift(nuevaVenta);

  guardarVentas();
  guardarProductos();
  renderTablaVentas();
  renderCajaDiaria();
  renderTablaProductos();
  cargarProductosEnVenta();
  renderDashboard();
  renderReportes();
  renderIndicadoresProveedores();

  mensaje.textContent = `Venta registrada correctamente con pago por ${metodoPago}.`;
  mensaje.style.color = "green";

  cart = [];
  document.getElementById("pago").value = "";
  renderCart();
}

function renderTablaVentas() {
  const tbody = document.querySelector("#tablaVentas tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (ventas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#7a5d68;">
          No hay ventas registradas.
        </td>
      </tr>
    `;
    return;
  }

  ventas.forEach((venta, index) => {
    const fila = document.createElement("tr");

    let estadoBadge = "";

      if (venta.estado === "completada") {
        estadoBadge = `<span class="tag success">Completada</span>`;
      } else if (venta.estado === "pendiente") {
        estadoBadge = `<span class="tag warning">Pendiente</span>`;
      } else {
        estadoBadge = `<span class="tag warning">Anulada</span>`;
      }

      fila.innerHTML = `
        <td>${venta.id}</td>
        <td>${venta.fecha}</td>
        <td>${venta.vendedor || "No asignado"}</td>
        <td>${venta.origen || "presencial"}</td>
        <td>S/ ${venta.total.toFixed(2)}</td>
        <td>${venta.metodoPago}</td>
        <td>${estadoBadge}</td>
        <td>
          <button class="btn-secondary" onclick="verDetalleVenta(${index})">Ver</button>
          ${
            venta.estado === "pendiente"
              ? `
                <button class="btn-primary" onclick="completarVenta(${index})">Completar</button>
                <button class="btn-warning" onclick="anularVenta(${index})">Anular</button>
              `
              : venta.estado === "completada"
                ? `
                  <button class="btn-secondary" onclick="imprimirTicketVenta(${index})">Ticket</button>
                  <button class="btn-warning" onclick="anularVenta(${index})">Anular</button>
                `
                : `<span style="color:#64748b;">Sin acciones</span>`
          }
        </td>
      `;

    tbody.appendChild(fila);
  });

  renderCajaDiaria();
}

function verDetalleVenta(index) {
  const venta = ventas[index];

  let detalle = `Venta #${venta.id}\n`;
  detalle += `Fecha: ${venta.fecha}\n`;
  detalle += `Pago: ${venta.metodoPago}\n`;
  detalle += `Estado: ${venta.estado}\n\n`;
  detalle += `Productos:\n`;

  venta.items.forEach(item => {
    detalle += `- ${item.nombre} | Color: ${item.color} | Talla: ${item.talla} | Cantidad: ${item.cantidad} | Subtotal: S/ ${(item.precio * item.cantidad).toFixed(2)}\n`;
  });

  detalle += `\nTotal: S/ ${venta.total.toFixed(2)}`;

  alert(detalle);
}

function anularVenta(index) {
  const venta = ventas[index];

  if (venta.estado === "anulada") {
    alert("La venta ya fue anulada.");
    return;
  }

  const confirmar = confirm(`¿Desea anular la venta #${venta.id}?`);

  if (!confirmar) return;

  venta.items.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
      producto.stock += item.cantidad;
    }
  });

  venta.estado = "anulada";

  guardarVentas();
  guardarProductos();
  renderTablaVentas();
  renderCajaDiaria();
  renderTablaProductos();
  renderCart();
  renderDashboard();
  renderReportes();
  renderIndicadoresProveedores();
}

function cargarProductosEnVenta() {
  const selectProducto = document.getElementById("ventaProducto");
  if (!selectProducto) return;

  selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';

  const nombresUnicos = [...new Set(
    productos
      .filter(producto => producto.estado === "activo")
      .map(producto => producto.nombre)
  )];

  nombresUnicos.forEach(nombre => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectProducto.appendChild(option);
  });
}

function actualizarOpcionesVenta() {
  const nombreProducto = document.getElementById("ventaProducto").value;
  const selectColor = document.getElementById("ventaColor");
  const selectTalla = document.getElementById("ventaTalla");

  selectColor.innerHTML = '<option value="">Seleccione un color</option>';
  selectTalla.innerHTML = '<option value="">Seleccione una talla</option>';

  document.getElementById("ventaPrecio").value = "";
  document.getElementById("ventaStock").value = "";

  if (!nombreProducto) return;

  const colores = [...new Set(
    productos
      .filter(producto =>
        producto.estado === "activo" &&
        producto.nombre === nombreProducto
      )
      .map(producto => producto.color)
  )];

  colores.forEach(color => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    selectColor.appendChild(option);
  });
}

function actualizarTallasVenta() {
  const nombreProducto = document.getElementById("ventaProducto").value;
  const colorProducto = document.getElementById("ventaColor").value;
  const selectTalla = document.getElementById("ventaTalla");

  selectTalla.innerHTML = '<option value="">Seleccione una talla</option>';

  document.getElementById("ventaPrecio").value = "";
  document.getElementById("ventaStock").value = "";

  if (!nombreProducto || !colorProducto) return;

  const tallas = [...new Set(
    productos
      .filter(producto =>
        producto.estado === "activo" &&
        producto.nombre === nombreProducto &&
        producto.color === colorProducto
      )
      .map(producto => producto.talla)
  )];

  tallas.forEach(talla => {
    const option = document.createElement("option");
    option.value = talla;
    option.textContent = talla;
    selectTalla.appendChild(option);
  });
}

function mostrarDetalleVenta() {
  const nombreProducto = document.getElementById("ventaProducto").value;
  const colorProducto = document.getElementById("ventaColor").value;
  const tallaProducto = document.getElementById("ventaTalla").value;

  const inputPrecio = document.getElementById("ventaPrecio");
  const inputStock = document.getElementById("ventaStock");

  inputPrecio.value = "";
  inputStock.value = "";

  if (!nombreProducto || !colorProducto || !tallaProducto) return;

  const producto = productos.find(producto =>
    producto.estado === "activo" &&
    producto.nombre === nombreProducto &&
    producto.color === colorProducto &&
    producto.talla === tallaProducto
  );

  if (!producto) return;

  inputPrecio.value = `S/ ${producto.precio.toFixed(2)}`;
  inputStock.value = producto.stock;
}
function agregarProductoSeleccionado() {
  const nombreProducto = document.getElementById("ventaProducto").value;
  const colorProducto = document.getElementById("ventaColor").value;
  const tallaProducto = document.getElementById("ventaTalla").value;
  const mensaje = document.getElementById("mensajeSeleccionVenta");

  if (!nombreProducto || !colorProducto || !tallaProducto) {
    mensaje.textContent = "Seleccione producto, color y talla.";
    mensaje.style.color = "red";
    return;
  }

  const producto = productos.find(producto =>
    producto.estado === "activo" &&
    producto.nombre === nombreProducto &&
    producto.color === colorProducto &&
    producto.talla === tallaProducto
  );

  if (!producto) {
    mensaje.textContent = "No se encontró la variante seleccionada.";
    mensaje.style.color = "red";
    return;
  }

  if (producto.stock <= 0) {
    mensaje.textContent = "La variante seleccionada no tiene stock.";
    mensaje.style.color = "red";
    return;
  }

  const itemExistente = cart.find(item => item.id === producto.id);

  if (itemExistente) {
    if (itemExistente.cantidad < producto.stock) {
      itemExistente.cantidad += 1;
    } else {
      mensaje.textContent = "No puede agregar más unidades que el stock disponible.";
      mensaje.style.color = "red";
      return;
    }
  } else {
    cart.push({
      id: producto.id,
      nombre: producto.nombre,
      color: producto.color,
      talla: producto.talla,
      precio: producto.precio,
      cantidad: 1
    });
  }

  mensaje.textContent = "Producto agregado al carrito.";
  mensaje.style.color = "green";

  renderCart();
  mostrarDetalleVenta();
}

function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

function cargarVentas() {
  const ventasGuardadas = localStorage.getItem("ventas");
  ventas = ventasGuardadas ? JSON.parse(ventasGuardadas) : [];
}

function completarVenta(index) {
  const venta = ventas[index];

  if (venta.estado !== "pendiente") {
    alert("Solo se pueden completar ventas pendientes.");
    return;
  }

  const confirmar = confirm(`¿Desea completar la venta #${venta.id}?`);

  if (!confirmar) return;

  venta.estado = "completada";
  venta.vendedor = localStorage.getItem("usuarioActivo") || "No asignado";
  venta.fechaCompletada = new Date().toLocaleString();

  guardarVentas();
  renderTablaVentas();
  renderCajaDiaria();
  renderDashboard();
  renderReportes();

  alert("Venta completada correctamente.");
}

function imprimirTicketVenta(index) {
  const venta = ventas[index];

  let productosHTML = "";

  venta.items.forEach(item => {
    productosHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>S/ ${item.precio.toFixed(2)}</td>
        <td>S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
      </tr>
    `;
  });

  const ventana = window.open("", "_blank", "width=400,height=600");

  ventana.document.write(`
    <html>
    <head>
      <title>Ticket Venta #${venta.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          width: 280px;
          margin: 0 auto;
          padding: 10px;
          font-size: 12px;
        }

        h2, h3, p {
          text-align: center;
          margin: 4px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          font-size: 11px;
          padding: 4px;
          border-bottom: 1px dashed #999;
          text-align: left;
        }

        .total {
          margin-top: 10px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }

        .right {
          text-align: right;
        }

        @media print {
          body {
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <h2>FashionStore</h2>
      <p>RUC: 00000000000</p>
      <p>Ticket de venta</p>
      <p>N° ${venta.id}</p>
      <p>Fecha: ${venta.fecha}</p>
      <p>Cliente: ${venta.cliente || "Cliente presencial"}</p>
      <p>Pago: ${venta.metodoPago}</p>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>P.U.</th>
            <th>Sub.</th>
          </tr>
        </thead>
        <tbody>
          ${productosHTML}
        </tbody>
      </table>

      <div class="total">
        <p class="right">Subtotal: S/ ${venta.subtotal.toFixed(2)}</p>
        <p class="right">IGV: S/ ${venta.igv.toFixed(2)}</p>
        <h3 class="right">Total: S/ ${venta.total.toFixed(2)}</h3>
      </div>

      <p>Gracias por su compra</p>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `);

  ventana.document.close();
}

function renderCajaDiaria() {
  const totalCaja = document.getElementById("cajaDiaTotal");
  const cantidadCaja = document.getElementById("cajaDiaCantidad");

  if (!totalCaja || !cantidadCaja) return;

  const hoy = new Date().toISOString().slice(0, 10);

  const ventasDelDia = ventas.filter(venta => {
    if (!venta.fechaISO) return false;

    const fechaVenta = venta.fechaISO.slice(0, 10);

    return venta.estado === "completada" && fechaVenta === hoy;
  });

  const total = ventasDelDia.reduce((acc, venta) => acc + Number(venta.total), 0);

  totalCaja.textContent = `S/ ${total.toFixed(2)}`;
  cantidadCaja.textContent = ventasDelDia.length;
}