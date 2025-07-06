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

app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cajas", cajasRoutes);
app.use("/api/suscripciones", suscripcionesRoutes);

app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));
