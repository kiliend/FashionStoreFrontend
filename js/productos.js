// PRODUCTOS
function registrarProducto() {
  const nombre = document.getElementById("nombreProducto").value.trim();
  const categoria = document.getElementById("categoriaProducto").value;
  const color = document.getElementById("colorProducto").value.trim();
  const talla = document.getElementById("tallaProducto").value.trim();
  const precio = document.getElementById("precioProducto").value.trim();
  const stock = document.getElementById("stockProducto").value.trim();
  const imagenInput = document.getElementById("imagenProducto");
  const mensaje = document.getElementById("mensajeProducto");
  const preview = document.getElementById("previewImagen");

  if (!nombre || !categoria || !color || !talla || !precio || !stock) {
    mensaje.textContent = "Complete todos los campos obligatorios.";
    mensaje.style.color = "red";
    return;
  }

  if (Number(precio) <= 0 || Number(stock) < 0) {
    mensaje.textContent = "Ingrese valores válidos en precio y stock.";
    mensaje.style.color = "red";
    return;
  }

  if (productoEditando !== null) {
    productos[productoEditando] = {
      ...productos[productoEditando],
      nombre,
      categoria,
      color,
      talla,
      precio: Number(precio),
      stock: Number(stock)
    };

    guardarProductos();
    renderTablaProductos();
    cargarProductosEnVenta();

    productoEditando = null;

    mensaje.textContent = "Producto actualizado correctamente.";
    mensaje.style.color = "green";
    limpiarFormularioProducto();
    return;
  }

  if (!imagenInput.files[0]) {
    mensaje.textContent = "Debe seleccionar una imagen para registrar el producto.";
    mensaje.style.color = "red";
    return;
  }

  const varianteExistente = productos.find(producto =>
    producto.nombre.toLowerCase() === nombre.toLowerCase() &&
    producto.color.toLowerCase() === color.toLowerCase() &&
    producto.talla.toLowerCase() === talla.toLowerCase()
  );

  if (varianteExistente) {
    mensaje.textContent = "Ya existe una variante con ese nombre, color y talla.";
    mensaje.style.color = "red";
    return;
  }

  const file = imagenInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const nuevoProducto = {
      id: Date.now(),
      nombre,
      categoria,
      color,
      talla,
      precio: Number(precio),
      stock: Number(stock),
      imagen: e.target.result,
      estado: "activo"
    };

    productos.push(nuevoProducto);
    guardarProductos();
    renderTablaProductos();
    cargarProductosEnVenta();

    mensaje.textContent = "Producto registrado correctamente.";
    mensaje.style.color = "green";

    limpiarFormularioProducto();
  };

  reader.readAsDataURL(file);
}

function limpiarFormularioProducto() {
  document.getElementById("nombreProducto").value = "";
  document.getElementById("categoriaProducto").value = "";
  document.getElementById("colorProducto").value = "";
  document.getElementById("tallaProducto").value = "";
  document.getElementById("precioProducto").value = "";
  document.getElementById("stockProducto").value = "";
  document.getElementById("imagenProducto").value = "";

  const preview = document.getElementById("previewImagen");
  if (preview) {
    preview.src = "";
    preview.style.display = "none";
  }
}

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function cargarProductos() {
  const productosGuardados = localStorage.getItem("productos");

  if (productosGuardados) {
    productos = JSON.parse(productosGuardados);
  } else {
    productos = [
      {
        id: 1,
        nombre: "Polo Oversize",
        categoria: "Ropa",
        color: "Negro",
        talla: "M",
        precio: 59.90,
        stock: 15,
        imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80"
      },
      {
        id: 2,
        nombre: "Zapatillas Urban",
        categoria: "Calzado",
        color: "Blanco",
        talla: "40",
        precio: 219.00,
        stock: 10,
        imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
      }
    ];
    guardarProductos();
  }
}

function renderTablaProductos() {
  const tbody = document.querySelector("#tablaProductos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  productos.forEach((producto, index) => {
    const fila = document.createElement("tr");

    const estadoBadge = producto.estado === "activo"
      ? `<span class="tag success">Activo</span>`
      : `<span class="tag warning">Inactivo</span>`;

    fila.innerHTML = `
      <td><img class="product-thumb" src="${producto.imagen}"></td>
      <td>${producto.nombre}</td>
      <td>${producto.categoria}</td>
      <td>${producto.color}</td>
      <td>${producto.talla}</td>
      <td>S/ ${producto.precio.toFixed(2)}</td>
      <td>${producto.stock}</td>
      <td>${estadoBadge}</td>
      <td>
        <button class="btn-secondary" onclick="editarProducto(${index})">Editar</button>
        <button class="${
          producto.estado === "activo" ? "btn-warning" : "btn-primary"
        }" onclick="toggleEstadoProducto(${index})">
          ${producto.estado === "activo" ? "Inactivar" : "Activar"}
        </button>
        <button class="btn-danger" onclick="eliminarProducto(${index})">Eliminar</button>
      </td>
    `;

    tbody.appendChild(fila);
  });
}

function eliminarProducto(index) {
  const confirmar = confirm("¿Desea eliminar este producto?");

  if (confirmar) {
    productos.splice(index, 1);
    guardarProductos();
    renderTablaProductos();
    renderProductosVenta();
  }
}


function editarProducto(index) {
  const producto = productos[index];
  productoEditando = index;

  document.getElementById("nombreProducto").value = producto.nombre;
  document.getElementById("categoriaProducto").value = producto.categoria;
  document.getElementById("colorProducto").value = producto.color;
  document.getElementById("tallaProducto").value = producto.talla;
  document.getElementById("precioProducto").value = producto.precio;
  document.getElementById("stockProducto").value = producto.stock;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleEstadoProducto(index) {
  const producto = productos[index];

  producto.estado = producto.estado === "activo" ? "inactivo" : "activo";

  guardarProductos();
  renderTablaProductos();
  renderProductosVenta();
}

function actualizarTallasPorCategoria() {
  const categoria = document.getElementById("categoriaProducto").value;
  const tallaSelect = document.getElementById("tallaProducto");

  tallaSelect.innerHTML = '<option value="">Seleccione una talla</option>';

  let tallas = [];

  if (categoria === "Ropa") {
    tallas = ["XS", "S", "M", "L", "XL", "XXL"];
  } else if (categoria === "Calzado") {
    tallas = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];
  } else if (categoria === "Accesorio") {
    tallas = ["Única"];
  }

  tallas.forEach(talla => {
    const option = document.createElement("option");
    option.value = talla;
    option.textContent = talla;
    tallaSelect.appendChild(option);
  });
}

function previewImagenProducto(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("previewImagen");

  if (!file) {
    preview.style.display = "none";
    preview.src = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function renderProductosVenta() {
  const contenedor = document.getElementById("listaProductosVenta");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = `<p class="empty-cart">No hay productos disponibles.</p>`;
    return;
  }

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.className = "product-item";

    div.innerHTML = `
      <div>
        <h4>${producto.nombre}</h4>
        <p>Color: ${producto.color} | Talla: ${producto.talla}</p>
        <p>S/ ${producto.precio.toFixed(2)} | Stock: ${producto.stock}</p>
      </div>
      <button class="btn-secondary" onclick="agregarAlCarrito(${producto.id})" ${producto.stock <= 0 ? "disabled" : ""}>
        ${producto.stock <= 0 ? "Sin stock" : "Agregar"}
      </button>
    `;

    contenedor.appendChild(div);
  });
}
