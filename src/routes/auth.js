const express = require("express");
const router = express.Router();
const Usuario = require("../models/usuario");
const bcrypt = require("bcryptjs");

router.post("/registro", async (req, res) => {
  try {
    const { nombre, apellido, email, password, experiencia, estilos } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = new Usuario({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      experiencia,
      estilos
    });

    await usuario.save();

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        experiencia: usuario.experiencia,
        estilos: usuario.estilos
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    res.json({
      message: "Login exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        experiencia: usuario.experiencia,
        estilos: usuario.estilos
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/perfil/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/perfil/:id", async (req, res) => {
  try {
    const { nombre, apellido, email, experiencia, estilos } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, email, experiencia, estilos },
      { new: true }
    ).select("-password");

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
