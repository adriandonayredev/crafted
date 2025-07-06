const mongoose = require("mongoose");

const ordenSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number, required: true },
    precio: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Orden", ordenSchema, "ordenes");
