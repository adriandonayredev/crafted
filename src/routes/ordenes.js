const express = require("express");
const router = express.Router();
const Orden = require("../models/orden");
const Producto = require("../models/producto");
const Usuario = require("../models/usuario");

router.post("/", async (req, res) => {
  try {
    const { productos, usuarioId } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Debe incluir al menos un producto" });
    }

    if (!usuarioId) {
      return res.status(400).json({ error: "Usuario requerido" });
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let total = 0;
    const productosValidados = [];

    for (const item of productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.producto} no encontrado` });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${producto.nombre}`
        });
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      productosValidados.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precio: producto.precio
      });
    }

    const orden = new Orden({
      usuario: usuarioId,
      productos: productosValidados,
      total: total
    });

    await orden.save();

    for (const item of productosValidados) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: -item.cantidad } }
      );
    }

    await orden.populate('productos.producto usuario');

    res.status(201).json({
      message: "Orden creada exitosamente",
      orden: orden
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { estado, limite = 10, pagina = 1 } = req.query;

    const filtros = { usuario: usuarioId };
    if (estado) {
      filtros.estado = estado;
    }

    const ordenes = await Orden.find(filtros)
      .populate('productos.producto')
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite));

    const total = await Orden.countDocuments(filtros);

    res.json({
      ordenes,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/:usuarioId", async (req, res) => {
  try {
    const { id, usuarioId } = req.params;

    const orden = await Orden.findOne({
      _id: id,
      usuario: usuarioId
    }).populate('productos.producto usuario');

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/cancelar", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    const orden = await Orden.findOne({
      _id: id,
      usuario: usuarioId
    });

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orden.estado !== 'pendiente') {
      return res.status(400).json({
        error: "Solo se pueden cancelar órdenes pendientes"
      });
    }

    for (const item of orden.productos) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: item.cantidad } }
      );
    }

    orden.estado = 'cancelada';
    await orden.save();

    res.json({
      message: "Orden cancelada exitosamente",
      orden: orden
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, usuarioId } = req.body;

    const estadosValidos = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const orden = await Orden.findOne({
      _id: id,
      usuario: usuarioId
    });

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (estado === 'cancelada' && orden.estado !== 'pendiente') {
      return res.status(400).json({
        error: "Solo se pueden cancelar órdenes pendientes"
      });
    }

    if (estado === 'cancelada') {
      for (const item of orden.productos) {
        await Producto.findByIdAndUpdate(
          item.producto,
          { $inc: { stock: item.cantidad } }
        );
      }
    }

    orden.estado = estado;
    await orden.save();

    res.json({
      message: "Estado de orden actualizado exitosamente",
      orden: orden
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/estadisticas/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const estadisticas = await Orden.aggregate([
      { $match: { usuario: usuarioId } },
      {
        $group: {
          _id: null,
          totalOrdenes: { $sum: 1 },
          totalGastado: { $sum: "$total" },
          ordenesPendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] }
          },
          ordenesConfirmadas: {
            $sum: { $cond: [{ $eq: ["$estado", "confirmada"] }, 1, 0] }
          },
          ordenesEnviadas: {
            $sum: { $cond: [{ $eq: ["$estado", "enviada"] }, 1, 0] }
          },
          ordenesEntregadas: {
            $sum: { $cond: [{ $eq: ["$estado", "entregada"] }, 1, 0] }
          },
          ordenesCanceladas: {
            $sum: { $cond: [{ $eq: ["$estado", "cancelada"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(estadisticas[0] || {
      totalOrdenes: 0,
      totalGastado: 0,
      ordenesPendientes: 0,
      ordenesConfirmadas: 0,
      ordenesEnviadas: 0,
      ordenesEntregadas: 0,
      ordenesCanceladas: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
