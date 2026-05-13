// INICIALIZAR USUARIOS
function inicializarUsuarios() {
  const usuariosGuardados = localStorage.getItem("usuarios");

  if (usuariosGuardados) {
    usuarios = JSON.parse(usuariosGuardados);
  } else {
    usuarios = [
      {
        nombre: "Administrador General",
        usuario: "admin",
        password: "123456",
        rol: "admin"
      }
    ];
    guardarUsuarios();
  }
}

function guardarUsuarios() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// LOGIN
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginMessage = document.getElementById("loginMessage");

  if (!username || !password) {
    loginMessage.textContent = "Complete usuario y contraseña.";
    loginMessage.style.color = "red";
    return;
  }

  const usuarioEncontrado = usuarios.find(
    user => user.usuario === username && user.password === password
  );

  if (usuarioEncontrado) {
    localStorage.setItem("sesionActiva", "true");
    localStorage.setItem("usuarioActivo", usuarioEncontrado.usuario);
    localStorage.setItem("rolActivo", usuarioEncontrado.rol);

    loginMessage.textContent = "";

    if (usuarioEncontrado.rol === "cliente") {
      window.location.href = "carrito.html";
      return;
    }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";
    document.getElementById("currentUser").textContent = usuarioEncontrado.usuario;

    renderTablaUsuarios();
    aplicarPermisosPorRol();
  } else {
    loginMessage.textContent = "Usuario o contraseña incorrectos.";
    loginMessage.style.color = "red";
  }
}

function logout() {
  localStorage.removeItem("sesionActiva");
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("rolActivo");

  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("app").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginMessage").textContent = "";
  document.querySelectorAll(".menu-item").forEach(btn => {
  btn.style.display = "block";
});
}

function obtenerUsuarioActivo() {
  const usuarioActivo = localStorage.getItem("usuarioActivo");
  return usuarios.find(user => user.usuario === usuarioActivo);
}

function esAdmin() {
  return localStorage.getItem("rolActivo") === "admin";
}

function showAuthTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

function registerUserFromLogin() {
  const nombre = document.getElementById("registerName").value.trim();
  const usuario = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const mensaje = document.getElementById("registerMessage");

  if (!nombre || !usuario || !password) {
    mensaje.textContent = "Complete todos los campos.";
    mensaje.style.color = "red";
    return;
  }

  if (password.length < 6) {
    mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
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
    rol: "cliente"
  });

  guardarUsuarios();

  mensaje.textContent = "Cuenta creada correctamente. Ahora puede iniciar sesión.";
  mensaje.style.color = "green";

  document.getElementById("registerName").value = "";
  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";

  showAuthTab("login");
}