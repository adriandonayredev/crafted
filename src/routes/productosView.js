const express = require("express");
const router = express.Router();

const productoController = require("../controllers/ProductoController");

// Mostrar TODOS los Productos (GET) - Página principal
router.get("/", productoController.mostrar);

// Crear Producto (POST)
router.post("/crear", productoController.crear);

// Editar Producto (POST)
router.post("/editar", productoController.editar);

// Eliminar Producto (GET)
router.get("/borrar/:id", productoController.borrar);

module.exports = router; 