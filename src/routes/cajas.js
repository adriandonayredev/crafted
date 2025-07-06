const express = require("express");
const router = express.Router();
const CajaTematica = require("../models/cajaTematica");
const Usuario = require("../models/usuario");

// Middleware de autenticación (reutilizar del archivo auth.js)
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

// Obtener cajas recomendadas para el usuario
router.get("/recomendadas", authMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

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

// Obtener todas las cajas
router.get("/", async (req, res) => {
  try {
    const cajas = await CajaTematica.find({ activa: true }).populate('productos.producto');
    res.json(cajas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener caja por ID
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
