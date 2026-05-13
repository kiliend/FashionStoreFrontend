// USUARIOS
function registrarUsuario() {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const usuario = document.getElementById("nuevoUsuario").value.trim();
  const password = document.getElementById("nuevoPassword").value.trim();
  const rol = document.getElementById("nuevoRol").value;
  const mensaje = document.getElementById("mensajeUsuario");

  if (!nombre || !usuario || !password || !rol) {
    mensaje.textContent = "Complete todos los campos del usuario.";
    mensaje.style.color = "red";
    return;
  }

  const usuarioExistente = usuarios.find(user => user.usuario === usuario);

  if (usuarioExistente) {
    mensaje.textContent = "Ese nombre de usuario ya existe.";
    mensaje.style.color = "red";
    return;
  }

  usuarios.push({
    nombre,
    usuario,
    password,
    rol
  });

  guardarUsuarios();
  renderTablaUsuarios();

  mensaje.textContent = "Usuario registrado correctamente.";
  mensaje.style.color = "green";

  document.getElementById("nuevoNombre").value = "";
  document.getElementById("nuevoUsuario").value = "";
  document.getElementById("nuevoPassword").value = "";
  document.getElementById("nuevoRol").value = "";
}


function renderTablaUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  usuarios.forEach((user, index) => {
    const fila = document.createElement("tr");

    const badgeClass =
      user.rol === "admin" ? "role-badge role-admin" : "role-badge role-vendedor";

    const estado = user.usuario === localStorage.getItem("usuarioActivo")
      ? "Activo"
      : "Registrado";

    let acciones = `<span style="color:#64748b;">Sin acciones</span>`;

    if (esAdmin()) {
      const usuarioActivo = localStorage.getItem("usuarioActivo");

      if (user.usuario !== usuarioActivo) {
        acciones = `<button class="btn-danger" onclick="eliminarUsuario(${index})">Eliminar</button>`;
      } else {
        acciones = `<span style="color:#2563eb; font-weight:600;">Usuario activo</span>`;
      }
    }

    fila.innerHTML = `
      <td>${user.nombre}</td>
      <td>${user.usuario}</td>
      <td><span class="${badgeClass}">${user.rol}</span></td>
      <td>${estado}</td>
      <td>${acciones}</td>
    `;

    tbody.appendChild(fila);
  });
}


function eliminarUsuario(index) {
  if (!esAdmin()) {
    alert("Solo el administrador puede eliminar usuarios.");
    return;
  }

  const usuarioAEliminar = usuarios[index];
  const usuarioActivo = localStorage.getItem("usuarioActivo");

  if (usuarioAEliminar.usuario === usuarioActivo) {
    alert("No puede eliminar su propio usuario mientras la sesión está activa.");
    return;
  }

  const confirmar = confirm(`¿Desea eliminar al usuario ${usuarioAEliminar.usuario}?`);

  if (confirmar) {
    usuarios.splice(index, 1);
    guardarUsuarios();
    renderTablaUsuarios();
  }
}
