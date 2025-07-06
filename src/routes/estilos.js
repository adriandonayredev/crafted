const express = require("express");
const router = express.Router();
const Estilo = require("../models/estilo");
const Usuario = require("../models/usuario");
const jwt = require("jsonwebtoken");

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No hay token, acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Obtener todos los estilos disponibles
router.get("/", async (req, res) => {
  try {
    const estilos = await Estilo.find({ activo: true }).sort({ nombre: 1 });
    res.json(estilos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener estilos por categoría
router.get("/categoria/:categoria", async (req, res) => {
  try {
    const { categoria } = req.params;
    const estilos = await Estilo.find({
      categoria: categoria,
      activo: true
    }).sort({ nombre: 1 });

    res.json(estilos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener preferencias del usuario
router.get("/preferencias", authMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener información completa de los estilos
    const estilosCompletos = await Estilo.find({
      nombre: { $in: usuario.estilos }
    });

    res.json({
      estilosSeleccionados: usuario.estilos,
      estilosCompletos: estilosCompletos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar preferencias del usuario
router.put("/preferencias", authMiddleware, async (req, res) => {
  try {
    const { estilos } = req.body;

    if (!Array.isArray(estilos)) {
      return res.status(400).json({ error: "Los estilos deben ser un array" });
    }

    // Verificar que todos los estilos existan
    const estilosExistentes = await Estilo.find({
      nombre: { $in: estilos },
      activo: true
    });

    if (estilosExistentes.length !== estilos.length) {
      return res.status(400).json({ error: "Algunos estilos no son válidos" });
    }

    // Actualizar usuario
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { estilos: estilos },
      { new: true }
    );

    res.json({
      message: "Preferencias actualizadas exitosamente",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        experiencia: usuario.experiencia,
        estilos: usuario.estilos
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear nuevo estilo (solo para administradores)
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, categoria, icono } = req.body;

    // Verificar que el estilo no exista
    const estiloExistente = await Estilo.findOne({ nombre });
    if (estiloExistente) {
      return res.status(400).json({ error: "El estilo ya existe" });
    }

    const estilo = new Estilo({
      nombre,
      descripcion,
      categoria,
      icono
    });

    await estilo.save();
    res.status(201).json(estilo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar estilo
router.put("/:id", async (req, res) => {
  try {
    const { nombre, descripcion, categoria, icono, activo } = req.body;

    const estilo = await Estilo.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, categoria, icono, activo },
      { new: true }
    );

    if (!estilo) {
      return res.status(404).json({ error: "Estilo no encontrado" });
    }

    res.json(estilo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar estilo (marcar como inactivo)
router.delete("/:id", async (req, res) => {
  try {
    const estilo = await Estilo.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!estilo) {
      return res.status(404).json({ error: "Estilo no encontrado" });
    }

    res.json({ message: "Estilo desactivado exitosamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener estadísticas de estilos
router.get("/estadisticas", async (req, res) => {
  try {
    const estadisticas = await Usuario.aggregate([
      { $unwind: "$estilos" },
      { $group: { _id: "$estilos", cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } }
    ]);

    // Obtener información completa de los estilos
    const estilosCompletos = await Estilo.find({});
    const resultado = estadisticas.map(stat => {
      const estiloInfo = estilosCompletos.find(e => e.nombre === stat._id);
      return {
        estilo: stat._id,
        cantidad: stat.cantidad,
        info: estiloInfo
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
