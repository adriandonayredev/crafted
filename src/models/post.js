const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id_usuario: { type: String, required: true, ref: 'Usuario' },
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  imagen_url: { type: String },
  tags: [{ type: String }],
  activo: { type: Boolean, default: true }
});

postSchema.index({ id_usuario: 1, fecha: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ activo: 1, fecha: -1 });

module.exports = mongoose.model("Post", postSchema, "posts");
