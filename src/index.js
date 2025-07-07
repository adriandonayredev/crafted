const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();

require("./database");

// Configuración de EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Configuración de sesiones
app.use(session({
    secret: 'crafted-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Importar las rutas de la API
const productosRoutes = require("./routes/productos");
const authRoutes = require("./routes/auth");
const cajasRoutes = require("./routes/cajas");
const suscripcionesRoutes = require("./routes/suscripciones");
const carritoRoutes = require("./routes/carrito");
const comprasRoutes = require("./routes/compras");
const estilosRoutes = require("./routes/estilos");
const ordenesRoutes = require("./routes/ordenes");
const postsRoutes = require("./routes/posts");
const comentariosRoutes = require("./routes/comentarios");

// Importar las rutas de la capa de presentación
const authViewRoutes = require("./routes/authView");
const productosViewRoutes = require("./routes/productosView");
const carritoViewRoutes = require('./routes/carritoView');
const comprasViewRoutes = require('./routes/comprasView');
const socialViewRoutes = require('./routes/socialView');
const perfilRoutes = require('./routes/perfil');
const misComprasRoutes = require('./routes/misCompras');

// Usar las rutas de la API
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cajas", cajasRoutes);
app.use("/api/suscripciones", suscripcionesRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/estilos", estilosRoutes);
app.use("/api/ordenes", ordenesRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comentarios", comentariosRoutes);

// Usar las rutas de la capa de presentación
app.use("/", authViewRoutes);
app.use("/admin", productosViewRoutes); // Ruta para administración de productos
app.use(carritoViewRoutes);
app.use(comprasViewRoutes);
app.use(socialViewRoutes);
app.use(perfilRoutes);
app.use(misComprasRoutes);

// Ruta de bienvenida para la API
app.get("/api", (req, res) => {
  res.json({
    message: "API Crafted - Sistema de gestión de productos creativos",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      productos: "/api/productos",
      cajas: "/api/cajas",
      suscripciones: "/api/suscripciones",
      carrito: "/api/carrito",
      compras: "/api/compras",
      estilos: "/api/estilos",
      ordenes: "/api/ordenes",
      posts: "/api/posts",
      comentarios: "/api/comentarios"
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: "La ruta solicitada no existe en el servidor"
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message
  });
});

app.listen(5001, () => console.log("Servidor iniciado en el puerto 5001"));
