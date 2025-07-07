const mongoose = require("mongoose");

const cajaTematicaSchema = new mongoose.Schema({
  _id: String,
  nombre: String,
  descripcion: String,
  tema: String,
  experiencia: String,
  productos: [{
    id_producto: String,
    cantidad: Number
  }]
});

module.exports = mongoose.model("CajaTematica", cajaTematicaSchema, "cajas_tematicas");
