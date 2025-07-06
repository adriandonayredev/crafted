const mongoose = require("mongoose");

const suscripcionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['Mensual', 'Trimestral', 'Anual'], required: true },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date, required: true },
  status: { type: String, enum: ['Activa', 'Pausada', 'Cancelada'], default: 'Activa' },
  precio: { type: Number, required: true }
});

module.exports = mongoose.model("Suscripcion", suscripcionSchema, "suscripciones");
