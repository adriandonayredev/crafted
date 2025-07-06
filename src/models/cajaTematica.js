const mongoose = require("mongoose");

const cajaTematicaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  tema: { type: String, required: true },
  experiencia: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], required: true },
  precio: { type: Number, required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number, default: 1 }
  }],
  imagen_url: String,
  activa: { type: Boolean, default: true }
});

module.exports = mongoose.model("CajaTematica", cajaTematicaSchema, "cajas_tematicas");
