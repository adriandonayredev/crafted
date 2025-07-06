const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, required: true, min: 1 }
  }],
  status: { type: String, enum: ['Activo', 'Pendiente', 'Completado', 'Cancelado'], default: 'Activo' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaModificacion: { type: Date, default: Date.now }
});


carritoSchema.pre('save', function(next) {
  this.fechaModificacion = new Date();
  next();
});

module.exports = mongoose.model("Carrito", carritoSchema, "carritos");
