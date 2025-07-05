const express = require("express");
const router = express.Router();
const Producto = require("../models/producto");

// Obtener todos los productos
router.get("/", async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

// Crear producto
router.post("/", async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto
router.put("/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar producto
router.delete("/:id", async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
