function actualizarNavSesion() {
  const navSesion = document.getElementById("navSesion");
  if (!navSesion) return;

  const sesionActiva = localStorage.getItem("sesionActiva");
  const usuarioActivo = localStorage.getItem("usuarioActivo");
  const rolActivo = localStorage.getItem("rolActivo");

  if (sesionActiva === "true" && rolActivo === "cliente") {
    navSesion.textContent = `Hola, ${usuarioActivo}`;
    navSesion.href = "carrito.html";
    navSesion.classList.add("cliente-activo");
  } else if (sesionActiva === "true" && rolActivo !== "cliente") {
    navSesion.textContent = "Panel";
    navSesion.href = "index.html";
  } else {
    navSesion.textContent = "Ingresar";
    navSesion.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", actualizarNavSesion);

function actualizarNavSesion() {
  const navSesion = document.getElementById("navSesion");
  const btnSalir = document.getElementById("btnCerrarSesionPublica");

  if (!navSesion) return;

  const sesionActiva = localStorage.getItem("sesionActiva");
  const usuarioActivo = localStorage.getItem("usuarioActivo");
  const rolActivo = localStorage.getItem("rolActivo");

  if (sesionActiva === "true" && rolActivo === "cliente") {
    navSesion.textContent = `Hola, ${usuarioActivo}`;
    navSesion.href = "carrito.html";

    if (btnSalir) btnSalir.style.display = "inline-block";
  } else if (sesionActiva === "true" && rolActivo !== "cliente") {
    navSesion.textContent = "Panel";
    navSesion.href = "index.html";

    if (btnSalir) btnSalir.style.display = "inline-block";
  } else {
    navSesion.textContent = "Ingresar";
    navSesion.href = "index.html";

    if (btnSalir) btnSalir.style.display = "none";
  }
}

function cerrarSesionPublica() {
  localStorage.removeItem("sesionActiva");
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("rolActivo");
  window.location.href = "landing.html";
}

document.addEventListener("DOMContentLoaded", actualizarNavSesion);