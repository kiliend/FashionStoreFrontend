// reportes
function renderReportes() {
  const ventasCompletadas = ventas.filter(venta => venta.estado === "completada");
  const ventasAnuladas = ventas.filter(venta => venta.estado === "anulada");

  document.getElementById("reporteVentasCompletadas").textContent = ventasCompletadas.length;
  document.getElementById("reporteVentasAnuladas").textContent = ventasAnuladas.length;

  const totalVendido = ventasCompletadas.reduce((acc, venta) => acc + venta.total, 0);
  document.getElementById("reporteTotalVendido").textContent = `S/ ${totalVendido.toFixed(2)}`;

  const totalProductosVendidos = ventasCompletadas.reduce((acc, venta) => {
    return acc + venta.items.reduce((sum, item) => sum + item.cantidad, 0);
  }, 0);
  document.getElementById("reporteTotalProductosVendidos").textContent = totalProductosVendidos;

  document.getElementById("reporteProductoTop").textContent = obtenerTopPorCampo("nombre");
  document.getElementById("reporteColorTop").textContent = obtenerTopPorCampo("color");
  document.getElementById("reporteTallaTop").textContent = obtenerTopPorCampo("talla");
  document.getElementById("reportePagoTop").textContent = obtenerMetodoPagoTop();

  renderAlertasInventarioReporte();
}


function obtenerTopPorCampo(campo) {
  const contador = {};

  ventas
    .filter(venta => venta.estado === "completada")
    .forEach(venta => {
      venta.items.forEach(item => {
        const clave = item[campo];
        if (!contador[clave]) {
          contador[clave] = 0;
        }
        contador[clave] += item.cantidad;
      });
    });

  const entries = Object.entries(contador);

  if (entries.length === 0) return "Sin datos disponibles.";

  const top = entries.reduce((max, actual) => actual[1] > max[1] ? actual : max);
  return `${top[0]} (${top[1]} vendidos)`;
}

function obtenerMetodoPagoTop() {
  const contador = {};

  ventas
    .filter(venta => venta.estado === "completada")
    .forEach(venta => {
      if (!contador[venta.metodoPago]) {
        contador[venta.metodoPago] = 0;
      }
      contador[venta.metodoPago] += 1;
    });

  const entries = Object.entries(contador);

  if (entries.length === 0) return "Sin datos disponibles.";

  const top = entries.reduce((max, actual) => actual[1] > max[1] ? actual : max);
  return `${top[0]} (${top[1]} ventas)`;
}

function renderAlertasInventarioReporte() {
  const contenedor = document.getElementById("reporteAlertasInventario");
  if (!contenedor) return;

  const stockBajo = productos.filter(
    producto => producto.estado === "activo" && producto.stock > 0 && producto.stock <= 5
  );

  const sinStock = productos.filter(
    producto => producto.estado === "activo" && producto.stock === 0
  );

  let alertas = [];

  stockBajo.forEach(producto => {
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

  sinStock.forEach(producto => {
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

  contenedor.innerHTML = alertas.slice(0, 6).join("");
}

function generarDatosReporte() {
  const ventasCompletadas = ventas.filter(v => v.estado === "completada");
  const ventasPendientes = ventas.filter(v => v.estado === "pendiente");
  const ventasAnuladas = ventas.filter(v => v.estado === "anulada");

  const totalGeneral = ventasCompletadas.reduce((acc, v) => acc + Number(v.total), 0);

  const ventasOnline = ventasCompletadas.filter(v => v.origen === "ecommerce");
  const ventasLocal = ventasCompletadas.filter(v => v.origen === "presencial");

  const totalOnline = ventasOnline.reduce((acc, v) => acc + Number(v.total), 0);
  const totalLocal = ventasLocal.reduce((acc, v) => acc + Number(v.total), 0);

  const ventasPorProducto = {};
  const ventasPorVendedor = {};

  ventasCompletadas.forEach(venta => {
    const vendedor = venta.vendedor || "No asignado";

    if (!ventasPorVendedor[vendedor]) {
      ventasPorVendedor[vendedor] = {
        vendedor,
        cantidadVentas: 0,
        totalVendido: 0
      };
    }

    ventasPorVendedor[vendedor].cantidadVentas += 1;
    ventasPorVendedor[vendedor].totalVendido += Number(venta.total);

    venta.items.forEach(item => {
      const nombre = item.nombre;

      if (!ventasPorProducto[nombre]) {
        ventasPorProducto[nombre] = {
          producto: nombre,
          cantidadVendida: 0,
          totalVendido: 0
        };
      }

      ventasPorProducto[nombre].cantidadVendida += Number(item.cantidad);
      ventasPorProducto[nombre].totalVendido += Number(item.precio) * Number(item.cantidad);
    });
  });

  const ingresoProductos = productos.map(producto => ({
    producto: producto.nombre,
    categoria: producto.categoria,
    color: producto.color,
    talla: producto.talla,
    stockActual: producto.stock,
    precio: producto.precio,
    estado: producto.estado || "activo"
  }));

  return {
    resumen: [
      ["Ventas completadas", ventasCompletadas.length],
      ["Ventas pendientes", ventasPendientes.length],
      ["Ventas anuladas", ventasAnuladas.length],
      ["Total general vendido", `S/ ${totalGeneral.toFixed(2)}`],
      ["Ventas online", ventasOnline.length],
      ["Total online", `S/ ${totalOnline.toFixed(2)}`],
      ["Ventas local", ventasLocal.length],
      ["Total local", `S/ ${totalLocal.toFixed(2)}`]
    ],
    ventasPorProducto: Object.values(ventasPorProducto),
    ventasPorVendedor: Object.values(ventasPorVendedor),
    ingresoProductos
  };
}

function descargarReportePDF() {
  const datos = generarDatosReporte();
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Informe General de Ventas - FashionStore", 14, 15);

  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 22);

  doc.autoTable({
    startY: 30,
    head: [["Indicador", "Valor"]],
    body: datos.resumen
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Producto", "Cantidad vendida", "Total vendido"]],
    body: datos.ventasPorProducto.map(item => [
      item.producto,
      item.cantidadVendida,
      `S/ ${item.totalVendido.toFixed(2)}`
    ])
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Vendedor", "Cantidad de ventas", "Total vendido"]],
    body: datos.ventasPorVendedor.map(item => [
      item.vendedor,
      item.cantidadVentas,
      `S/ ${item.totalVendido.toFixed(2)}`
    ])
  });

  doc.addPage();

  doc.setFontSize(14);
  doc.text("Ingreso y estado de productos", 14, 15);

  doc.autoTable({
    startY: 22,
    head: [["Producto", "Categoría", "Color", "Talla", "Stock", "Precio", "Estado"]],
    body: datos.ingresoProductos.map(item => [
      item.producto,
      item.categoria,
      item.color,
      item.talla,
      item.stockActual,
      `S/ ${Number(item.precio).toFixed(2)}`,
      item.estado
    ])
  });

  doc.save("informe_ventas_fashionstore.pdf");
}

function descargarReporteExcel() {
  const datos = generarDatosReporte();

  const wb = XLSX.utils.book_new();

  const resumenData = [
    ["INFORME GENERAL DE VENTAS - FASHIONSTORE"],
    ["Fecha de generación", new Date().toLocaleString()],
    [],
    ["RESUMEN GENERAL"],
    ["Indicador", "Valor"],
    ...datos.resumen
  ];

  const hojaResumen = XLSX.utils.aoa_to_sheet(resumenData);

  hojaResumen["!cols"] = [
    { wch: 32 },
    { wch: 24 }
  ];

  hojaResumen["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
  ];

  hojaResumen["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "D9467A" } },
    alignment: { horizontal: "center" }
  };

  hojaResumen["A4"].s = {
    font: { bold: true, color: { rgb: "B83267" } }
  };

  ["A5", "B5"].forEach(celda => {
    hojaResumen[celda].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "B83267" } },
      alignment: { horizontal: "center" }
    };
  });

  const hojaProducto = XLSX.utils.json_to_sheet(datos.ventasPorProducto.map(item => ({
    Producto: item.producto,
    "Cantidad vendida": item.cantidadVendida,
    "Total vendido": item.totalVendido
  })));

  const hojaVendedor = XLSX.utils.json_to_sheet(datos.ventasPorVendedor.map(item => ({
    Vendedor: item.vendedor,
    "Cantidad de ventas": item.cantidadVentas,
    "Total vendido": item.totalVendido
  })));

  const hojaProductos = XLSX.utils.json_to_sheet(datos.ingresoProductos.map(item => ({
    Producto: item.producto,
    Categoría: item.categoria,
    Color: item.color,
    Talla: item.talla,
    "Stock actual": item.stockActual,
    Precio: item.precio,
    Estado: item.estado
  })));

  aplicarEstiloHoja(hojaProducto, [28, 18, 18]);
  aplicarEstiloHoja(hojaVendedor, [28, 20, 18]);
  aplicarEstiloHoja(hojaProductos, [28, 18, 16, 14, 16, 14, 14]);

  XLSX.utils.book_append_sheet(wb, hojaResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, hojaProducto, "Ventas por producto");
  XLSX.utils.book_append_sheet(wb, hojaVendedor, "Ventas por vendedor");
  XLSX.utils.book_append_sheet(wb, hojaProductos, "Ingreso productos");

  XLSX.writeFile(wb, "informe_ventas_fashionstore.xlsx");
}

function aplicarEstiloHoja(ws, anchosColumnas) {
  ws["!cols"] = anchosColumnas.map(ancho => ({ wch: ancho }));

  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let C = range.s.c; C <= range.e.c; C++) {
    const celda = XLSX.utils.encode_cell({ r: 0, c: C });

    if (ws[celda]) {
      ws[celda].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "B83267" } },
        alignment: { horizontal: "center" }
      };
    }
  }

  for (let R = 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const celda = XLSX.utils.encode_cell({ r: R, c: C });

      if (ws[celda]) {
        ws[celda].s = {
          border: {
            bottom: { style: "thin", color: { rgb: "F1D7E1" } }
          },
          alignment: { vertical: "center" }
        };
      }
    }
  }
}