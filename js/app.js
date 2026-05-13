let cart = [];
let usuarios = [];
let productos = [];
let ventas = [];
let productoEditando = null;
let proveedores = [];
let ordenesCompra = [];
let ordenCompraItems = [];

window.onload = function () {
  inicializarUsuarios();
  cargarProductos();
  cargarVentas();

  renderTablaVentas();
  renderDashboard();
  renderReportes();

  cargarProveedores();
  cargarOrdenesCompra();
  renderProveedores();
  renderOrdenesCompra();
  renderIndicadoresProveedores();
  renderMensajesContacto();
  aplicarPermisosPorRol();

  const sesionActiva = localStorage.getItem("sesionActiva");
  const usuarioActivo = localStorage.getItem("usuarioActivo");

  const rolActivo = localStorage.getItem("rolActivo");

  if (sesionActiva === "true") {
    if (rolActivo === "cliente") {
      window.location.href = "carrito.html";
      return;
    }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";
    document.getElementById("currentUser").textContent = usuarioActivo || "admin";

    renderTablaUsuarios();
    renderTablaProductos();
    cargarProductosEnVenta();
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const inputImagen = document.getElementById("imagenProducto");

  if (inputImagen) {
    inputImagen.addEventListener("change", previewImagenProducto);
  }
});
function showSection(sectionId, element) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.remove("active");
  });

  element.classList.add("active");

  if (sectionId === "usuarios") {
    renderTablaUsuarios();
  }

  if (sectionId === "productos") {
    renderTablaProductos();
  }

  if (sectionId === "ventas") {
    cargarProductosEnVenta();
    renderTablaVentas();
  }

  if (sectionId === "dashboard") {
    renderDashboard();
  }

  if (sectionId === "reportes") {
    renderReportes();
  }

  if (sectionId === "proveedores") {
  renderProveedores();
  renderOrdenesCompra();
  cargarSelectProveedores();
  renderIndicadoresProveedores();
  }

  if (sectionId === "mensajes") {
  renderMensajesContacto();
}
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (window.innerWidth > 900) {
    sidebar.classList.toggle("hidden");
  }
}

function aplicarPermisosPorRol() {
  const rolActivo = localStorage.getItem("rolActivo");

  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.style.display = "block";
  });

  if (rolActivo === "vendedor") {
    document.querySelectorAll(".menu-item").forEach(btn => {
      const texto = btn.textContent.toLowerCase();

      if (
        !texto.includes("ventas") &&
        !texto.includes("dashboard")
      ) {
        btn.style.display = "none";
      }
    });

    const btnVentas = document.querySelector(".menu-item[onclick*='ventas']");
    if (btnVentas) {
      showSection("ventas", btnVentas);
    }
  }

  if (rolActivo === "admin") {
    const btnDashboard = document.querySelector(".menu-item[onclick*='dashboard']");
    if (btnDashboard) {
      showSection("dashboard", btnDashboard);
    }
  }
}