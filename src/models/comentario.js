const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id_post: { type: String, required: true, ref: 'Post' },
  id_usuario: { type: String, required: true, ref: 'Usuario' },
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true }
});

comentarioSchema.index({ id_post: 1, fecha: -1 });
comentarioSchema.index({ id_usuario: 1, fecha: -1 });
comentarioSchema.index({ activo: 1, fecha: -1 });

module.exports = mongoose.model("ComentarioPost", comentarioSchema, "comentarios_posts");
