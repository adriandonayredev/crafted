const express = require("express");
const app = express();

require("./database");

app.use(express.json());

//Importar las rutas
const productosRoutes = require("./routes/productos");
app.use("/api/productos", productosRoutes);

app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));
