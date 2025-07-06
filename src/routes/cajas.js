const express = require("express");
const router = express.Router();
const CajaTematica = require("../models/cajaTematica");
const Usuario = require("../models/usuario");

router.get("/recomendadas/:usuarioId", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const cajasRecomendadas = await CajaTematica.find({
      tema: { $in: usuario.estilos },
      experiencia: usuario.experiencia,
      activa: true
    }).populate('productos.producto');

    res.json(cajasRecomendadas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const cajas = await CajaTematica.find({ activa: true }).populate('productos.producto');
    res.json(cajas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const caja = await CajaTematica.findById(req.params.id).populate('productos.producto');
    if (!caja) {
      return res.status(404).json({ error: "Caja no encontrada" });
    }
    res.json(caja);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
