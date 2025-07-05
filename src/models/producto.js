const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  _id: String,
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  imagen_url: String,
  experiencia: String // Si lo necesitas
});

module.exports = mongoose.model("Producto", productoSchema, "productos");
