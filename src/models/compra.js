const mongoose = require("mongoose");

const compraSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  metodoPago: { type: String, enum: ['Tarjeta', 'PayPal', 'Transferencia'], required: true },
  estado: { type: String, enum: ['Pendiente', 'Confirmada', 'Procesando', 'Enviada', 'Entregada', 'Cancelada'], default: 'Pendiente' },
  fecha: { type: Date, default: Date.now },
  numeroOrden: { type: String, unique: true }
});

// Generar número de orden único antes de guardar
compraSchema.pre('save', function(next) {
  if (!this.numeroOrden) {
    this.numeroOrden = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model("Compra", compraSchema, "compras");
