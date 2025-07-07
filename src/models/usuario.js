const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  _id: String,
  nombre: String,
  apellido: String,
  email: String,
  password: String,
  experiencia: String,
  hobbies: [{
    _id: Number,
    nombre: String
  }],
  suscripciones: [{
    _id: String,
    nombre: String,
    fecha_ini: Date,
    fecha_fin: Date,
    estado: String,
    periodo: String,
    precio: Number,
    metodo_pago: String
  }],
  carrito: {
    _id: String,
    fecha_creacion: Date,
    status: String,
    items: [{
      id_producto: String,
      nombre: String,
      cantidad: Number
    }]
  },
  caja_tematica: String
});

module.exports = mongoose.model("Usuario", usuarioSchema, "usuarios");
