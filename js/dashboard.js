// DASHBOARD 
function renderDashboard() {
  const totalVentas = ventas
    .filter(venta => venta.estado === "completada")
    .reduce((acc, venta) => acc + venta.total, 0);

  const productosActivos = productos.filter(producto => producto.estado === "activo").length;
  const productosInactivos = productos.filter(producto => producto.estado === "inactivo").length;

  const stockTotal = productos
    .filter(producto => producto.estado === "activo")
    .reduce((acc, producto) => acc + producto.stock, 0);

  document.getElementById("dashboardVentas").textContent = `S/ ${totalVentas.toFixed(2)}`;
  document.getElementById("dashboardActivos").textContent = productosActivos;
  document.getElementById("dashboardInactivos").textContent = productosInactivos;
  document.getElementById("dashboardStock").textContent = stockTotal;

  renderDashboardUltimasVentas();
  renderDashboardAlertas();
}


function renderDashboardUltimasVentas() {
  const contenedor = document.getElementById("dashboardUltimasVentas");
  if (!contenedor) return;

  if (ventas.length === 0) {
    contenedor.innerHTML = `<p class="empty-cart">No hay ventas registradas todavía.</p>`;
    return;
  }

  const ultimasVentas = ventas.slice(0, 5);

  contenedor.innerHTML = ultimasVentas.map(venta => `
    <div class="product-item">
      <div>
        <h4>Venta #${venta.id}</h4>
        <p>${venta.fecha}</p>
        <p>${venta.metodoPago} | ${venta.estado}</p>
      </div>
      <strong>S/ ${venta.total.toFixed(2)}</strong>
    </div>
  `).join("");
}

function renderDashboardAlertas() {
  const contenedor = document.getElementById("dashboardAlertas");
  if (!contenedor) return;

  const productosStockBajo = productos.filter(
    producto => producto.estado === "activo" && producto.stock > 0 && producto.stock <= 5
  );

  const productosSinStock = productos.filter(
    producto => producto.estado === "activo" && producto.stock === 0
  );

  let alertas = [];

  productosStockBajo.forEach(producto => {
    alertas.push(`
      <div class="product-item">
        <div>
          <h4>Stock bajo</h4>
          <p>${producto.nombre} - ${producto.color} - ${producto.talla}</p>
        </div>
        <strong>${producto.stock} und.</strong>
      </div>
    `);
  });

  productosSinStock.forEach(producto => {
    alertas.push(`
      <div class="product-item">
        <div>
          <h4>Sin stock</h4>
          <p>${producto.nombre} - ${producto.color} - ${producto.talla}</p>
        </div>
        <strong>0 und.</strong>
      </div>
    `);
  });

  if (alertas.length === 0) {
    contenedor.innerHTML = `<p class="empty-cart">No hay alertas disponibles.</p>`;
    return;
  }

  contenedor.innerHTML = alertas.slice(0, 5).join("");
}