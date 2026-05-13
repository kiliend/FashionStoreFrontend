function cargarMensajesContacto() {
  return JSON.parse(localStorage.getItem("mensajesContacto")) || [];
}

function guardarMensajesContacto(mensajes) {
  localStorage.setItem("mensajesContacto", JSON.stringify(mensajes));
}

function renderMensajesContacto() {
  const tbody = document.querySelector("#tablaMensajesContacto tbody");
  if (!tbody) return;

  const mensajes = cargarMensajesContacto();

  tbody.innerHTML = "";

  if (mensajes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#7a5d68;">
          No hay mensajes recibidos.
        </td>
      </tr>
    `;
    return;
  }

  mensajes.forEach((msg, index) => {
    const estadoBadge = msg.estado === "nuevo"
      ? `<span class="tag warning">Nuevo</span>`
      : `<span class="tag success">Leído</span>`;

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${msg.nombre}</td>
      <td>${msg.correo}</td>
      <td>${msg.mensaje}</td>
      <td>${msg.fecha}</td>
      <td>${estadoBadge}</td>
      <td>
        <button class="btn-secondary" onclick="marcarMensajeLeido(${index})">Leído</button>
        <button class="btn-danger" onclick="eliminarMensajeContacto(${index})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(fila);
  });
}

function marcarMensajeLeido(index) {
  const mensajes = cargarMensajesContacto();
  mensajes[index].estado = "leido";
  guardarMensajesContacto(mensajes);
  renderMensajesContacto();
}

function eliminarMensajeContacto(index) {
  const mensajes = cargarMensajesContacto();

  if (!confirm("¿Desea eliminar este mensaje?")) return;

  mensajes.splice(index, 1);
  guardarMensajesContacto(mensajes);
  renderMensajesContacto();
}