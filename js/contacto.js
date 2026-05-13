function enviarMensajeContacto() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();
  const aviso = document.getElementById("contactoMensaje");

  if (!nombre || !correo || !mensaje) {
    aviso.textContent = "Complete todos los campos.";
    aviso.style.color = "red";
    return;
  }

  const mensajesContacto = JSON.parse(localStorage.getItem("mensajesContacto")) || [];

  mensajesContacto.unshift({
    id: Date.now(),
    nombre,
    correo,
    mensaje,
    fecha: new Date().toLocaleString(),
    estado: "nuevo"
  });

  localStorage.setItem("mensajesContacto", JSON.stringify(mensajesContacto));

  aviso.textContent = "Mensaje enviado correctamente.";
  aviso.style.color = "green";

  document.getElementById("nombre").value = "";
  document.getElementById("correo").value = "";
  document.getElementById("mensaje").value = "";
}