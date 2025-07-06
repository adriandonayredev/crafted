const express = require("express");
const router = express.Router();
const Usuario = require("../models/usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/registro", async (req, res) => {
  try {
    const { nombre, apellido, email, password, experiencia, estilos } = req.body;

    // Verificar si el usuario ya existe
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

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
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

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
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

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No hay token, acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

router.get("/perfil", authMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password");
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/perfil", authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, email, experiencia, estilos } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { nombre, apellido, email, experiencia, estilos },
      { new: true }
    ).select("-password");

    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
