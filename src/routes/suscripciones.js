const express = require("express");
const router = express.Router();
const Suscripcion = require("../models/suscripcion");

router.get("/:usuarioId", async (req, res) => {
  try {
    const suscripcion = await Suscripcion.findOne({
      usuario: req.params.usuarioId,
      status: { $in: ['Activa', 'Pausada'] }
    }).populate('usuario', 'nombre apellido email');

    res.json(suscripcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { tipo, usuarioId } = req.body;

    const suscripcionExistente = await Suscripcion.findOne({
      usuario: usuarioId,
      status: { $in: ['Activa', 'Pausada'] }
    });

    if (suscripcionExistente) {
      return res.status(400).json({ error: "Ya tienes una suscripción activa" });
    }

    let precio, fechaFin;
    const fechaInicio = new Date();

    switch (tipo) {
      case 'Mensual':
        precio = 29.99;
        fechaFin = new Date(fechaInicio.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Trimestral':
        precio = 79.99;
        fechaFin = new Date(fechaInicio.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      case 'Anual':
        precio = 299.99;
        fechaFin = new Date(fechaInicio.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ error: "Tipo de suscripción inválido" });
    }

    const suscripcion = new Suscripcion({
      usuario: usuarioId,
      tipo,
      fechaInicio,
      fechaFin,
      precio
    });

    await suscripcion.save();

    res.status(201).json(suscripcion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id/estado", async (req, res) => {
  try {
    const { status, usuarioId } = req.body;

    const suscripcion = await Suscripcion.findOneAndUpdate(
      { _id: req.params.id, usuario: usuarioId },
      { status },
      { new: true }
    );

    if (!suscripcion) {
      return res.status(404).json({ error: "Suscripción no encontrada" });
    }

    res.json(suscripcion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
