const express = require("express");
const router = express.Router();
const carritoController = require("../controllers/CarritoController");

router.get("/carrito", carritoController.mostrarCarrito);
router.post("/carrito/agregar", carritoController.agregarAlCarrito);
router.post("/carrito/actualizar", carritoController.actualizarCantidad);
router.post("/carrito/eliminar", carritoController.eliminarDelCarrito);
router.get("/carrito/count", carritoController.contarCarrito);

module.exports = router;
