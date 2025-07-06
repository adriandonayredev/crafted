const express = require("express");
const router = express.Router();
const Suscripcion = require("../models/suscripcion");

// Middleware de autenticación (reutilizar)
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No hay token, acceso denegado" });
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Obtener suscripción activa del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const suscripcion = await Suscripcion.findOne({
      usuario: req.usuario.id,
      status: { $in: ['Activa', 'Pausada'] }
    }).populate('usuario', 'nombre apellido email');

    res.json(suscripcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva suscripción
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tipo } = req.body;

    // Verificar si ya tiene suscripción activa
    const suscripcionExistente = await Suscripcion.findOne({
      usuario: req.usuario.id,
      status: { $in: ['Activa', 'Pausada'] }
    });

    if (suscripcionExistente) {
      return res.status(400).json({ error: "Ya tienes una suscripción activa" });
    }

    // Calcular precio y fecha fin
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
      usuario: req.usuario.id,
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

// Actualizar estado de suscripción
router.put("/:id/estado", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const suscripcion = await Suscripcion.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario.id },
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
