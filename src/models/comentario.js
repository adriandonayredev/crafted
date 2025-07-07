const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  _id: String,
  id_post: String,
  id_usuario: String,
  texto: String,
  fecha: Date
});

module.exports = mongoose.model("Comentario", comentarioSchema, "comentarios_posts");
