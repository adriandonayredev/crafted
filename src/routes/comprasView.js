const express = require("express");
const router = express.Router();
const compraController = require("../controllers/CompraController");

router.get("/checkout", compraController.mostrarCheckout);
router.post("/checkout/procesar", compraController.procesarCompra);
router.get("/compra/confirmacion/:idCompra", compraController.mostrarConfirmacion);
router.get("/mis-compras", compraController.mostrarHistorial);

module.exports = router; 