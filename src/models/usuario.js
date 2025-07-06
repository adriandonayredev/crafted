const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  experiencia: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], required: true },
  estilos: [{ type: String }], // Array de estilos creativos
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");
