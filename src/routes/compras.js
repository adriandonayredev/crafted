const express = require("express");
const router = express.Router();
const Compra = require("../models/compra");
const Carrito = require("../models/carrito");
const Producto = require("../models/producto");
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

// Procesar compra desde el carrito
router.post("/procesar", authMiddleware, async (req, res) => {
  try {
    const { metodoPago } = req.body;

    if (!metodoPago) {
      return res.status(400).json({ error: "Método de pago requerido" });
    }

    // Obtener carrito activo
    const carrito = await Carrito.findOne({
      usuario: req.usuario.id,
      status: 'Activo'
    }).populate('productos.producto');

    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Verificar stock de todos los productos
    for (const item of carrito.productos) {
      if (item.producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.producto.nombre}`
        });
      }
    }

    // Calcular total
    const total = carrito.productos.reduce((sum, item) => {
      return sum + (item.producto.precio * item.cantidad);
    }, 0);

    // Crear compra
    const compra = new Compra({
      usuario: req.usuario.id,
      productos: carrito.productos.map(item => ({
        producto: item.producto._id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio
      })),
      total: total,
      metodoPago: metodoPago
    });

    await compra.save();

    // Actualizar stock de productos
    for (const item of carrito.productos) {
      await Producto.findByIdAndUpdate(
        item.producto._id,
        { $inc: { stock: -item.cantidad } }
      );
    }

    // Marcar carrito como completado
    carrito.status = 'Completado';
    await carrito.save();

    // Popular la compra antes de enviarla
    await compra.populate('productos.producto usuario');

    res.status(201).json({
      message: "Compra realizada exitosamente",
      compra: compra
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener historial de compras del usuario
router.get("/historial", authMiddleware, async (req, res) => {
  try {
    const compras = await Compra.find({ usuario: req.usuario.id })
      .populate('productos.producto')
      .sort({ fecha: -1 });

    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener detalles de una compra específica
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const compra = await Compra.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    }).populate('productos.producto usuario');

    if (!compra) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    res.json(compra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancelar compra (solo si está en estado pendiente)
router.put("/:id/cancelar", authMiddleware, async (req, res) => {
  try {
    const compra = await Compra.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!compra) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    if (compra.estado !== 'Pendiente') {
      return res.status(400).json({
        error: "Solo se pueden cancelar compras en estado pendiente"
      });
    }

    // Restaurar stock
    for (const item of compra.productos) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: item.cantidad } }
      );
    }

    compra.estado = 'Cancelada';
    await compra.save();

    res.json({
      message: "Compra cancelada exitosamente",
      compra: compra
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener estadísticas de compras del usuario
router.get("/estadisticas/resumen", authMiddleware, async (req, res) => {
  try {
    const estadisticas = await Compra.aggregate([
      { $match: { usuario: req.usuario.id } },
      {
        $group: {
          _id: null,
          totalCompras: { $sum: 1 },
          totalGastado: { $sum: "$total" },
          comprasPendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "Pendiente"] }, 1, 0] }
          },
          comprasConfirmadas: {
            $sum: { $cond: [{ $eq: ["$estado", "Confirmada"] }, 1, 0] }
          },
          comprasEntregadas: {
            $sum: { $cond: [{ $eq: ["$estado", "Entregada"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(estadisticas[0] || {
      totalCompras: 0,
      totalGastado: 0,
      comprasPendientes: 0,
      comprasConfirmadas: 0,
      comprasEntregadas: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
