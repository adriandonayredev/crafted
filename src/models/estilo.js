const mongoose = require("mongoose");

const estiloSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String },
  icono: { type: String }, // Para mostrar iconos en la interfaz
  activo: { type: Boolean, default: true },
  categoria: { type: String, enum: ['Arte', 'Manualidades', 'Decoración', 'Música', 'Escritura', 'Fotografía', 'Otro'], default: 'Arte' }
});

module.exports = mongoose.model("Estilo", estiloSchema, "estilos");
