const express = require("express");
const router = express.Router();
const Orden = require("../models/orden");
const Producto = require("../models/producto");
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

// Crear nueva orden
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Debe incluir al menos un producto" });
    }

    // Verificar que todos los productos existan y calcular total
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

    // Crear la orden
    const orden = new Orden({
      usuario: req.usuario.id,
      productos: productosValidados,
      total: total
    });

    await orden.save();

    // Actualizar stock de productos
    for (const item of productosValidados) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: -item.cantidad } }
      );
    }

    // Popular la orden antes de enviarla
    await orden.populate('productos.producto usuario');

    res.status(201).json({
      message: "Orden creada exitosamente",
      orden: orden
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todas las órdenes del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, limite = 10, pagina = 1 } = req.query;

    const filtros = { usuario: req.usuario.id };
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

// Obtener orden específica
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const orden = await Orden.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    }).populate('productos.producto usuario');

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
