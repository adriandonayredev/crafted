const express = require("express");
const cors = require("cors");
const app = express();

require("./database");

app.use(cors());
app.use(express.json());

// Importar las rutas
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

// Usar las rutas
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

// Ruta de bienvenida
app.get("/", (req, res) => {
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

app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));
