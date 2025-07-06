const express = require("express");
const router = express.Router();
const Carrito = require("../models/carrito");
const Producto = require("../models/producto");

// Obtener carrito activo del usuario
router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    let carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    }).populate('productos.producto');

    // Si no existe carrito activo, crear uno nuevo
    if (!carrito) {
      carrito = new Carrito({
        usuario: usuarioId,
        productos: []
      });
      await carrito.save();
    }

    res.json(carrito);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/agregar", async (req, res) => {
  try {
    const { usuarioId, productoId, cantidad = 1 } = req.body;

    // Verificar que el producto existe
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar stock disponible
    if (producto.stock < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // Buscar carrito activo o crear uno nuevo
    let carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    });

    if (!carrito) {
      carrito = new Carrito({
        usuario: usuarioId,
        productos: []
      });
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.productos.find(
      p => p.producto.toString() === productoId
    );

    if (productoExistente) {
      // Actualizar cantidad
      productoExistente.cantidad += cantidad;
    } else {
      // Agregar nuevo producto
      carrito.productos.push({
        producto: productoId,
        cantidad: cantidad
      });
    }

    await carrito.save();

    // Popular el carrito antes de enviarlo
    await carrito.populate('productos.producto');

    res.json({
      message: "Producto agregado al carrito",
      carrito: carrito
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/actualizar", async (req, res) => {
  try {
    const { usuarioId, productoId, cantidad } = req.body;

    if (cantidad < 1) {
      return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productoIndex = carrito.productos.findIndex(
      p => p.producto.toString() === productoId
    );

    if (productoIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    // Verificar stock disponible
    const producto = await Producto.findById(productoId);
    if (producto.stock < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    carrito.productos[productoIndex].cantidad = cantidad;
    await carrito.save();

    await carrito.populate('productos.producto');

    res.json({
      message: "Cantidad actualizada",
      carrito: carrito
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/eliminar", async (req, res) => {
  try {
    const { usuarioId, productoId } = req.body;

    const carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    carrito.productos = carrito.productos.filter(
      p => p.producto.toString() !== productoId
    );

    await carrito.save();
    await carrito.populate('productos.producto');

    res.json({
      message: "Producto eliminado del carrito",
      carrito: carrito
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/vaciar", async (req, res) => {
  try {
    const { usuarioId } = req.body;

    const carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    carrito.productos = [];
    await carrito.save();

    res.json({
      message: "Carrito vaciado",
      carrito: carrito
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/total/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const carrito = await Carrito.findOne({
      usuario: usuarioId,
      status: 'Activo'
    }).populate('productos.producto');

    if (!carrito) {
      return res.json({ total: 0, cantidadProductos: 0 });
    }

    const total = carrito.productos.reduce((sum, item) => {
      return sum + (item.producto.precio * item.cantidad);
    }, 0);

    const cantidadProductos = carrito.productos.reduce((sum, item) => {
      return sum + item.cantidad;
    }, 0);

    res.json({ total, cantidadProductos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
