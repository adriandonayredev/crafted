const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");
const inicioController = require("../controllers/InicioController");
const productosController = require("../controllers/ProductosController");
const socialController = require("../controllers/SocialController");

// Rutas de autenticación
router.get("/login", authController.mostrarLogin);
router.post("/login", authController.login);
router.get("/registro", authController.mostrarRegistro);
router.post("/registro", authController.registro);
router.get("/logout", authController.logout);

// Formulario de preferencias
router.get("/preferencias", authController.mostrarPreferencias);
router.post("/preferencias", authController.procesarPreferencias);

// Páginas principales
router.get("/inicio", inicioController.mostrarInicio);
router.get("/productos", productosController.mostrarProductos);
router.get("/social", socialController.mostrarSocial);

// Acciones sociales
router.post("/social/crear-post", socialController.crearPost);
router.post("/social/comentar", socialController.agregarComentario);

// Ruta raíz - redirigir a login si no está autenticado
router.get("/", (req, res) => {
    if (req.session.usuario) {
        res.redirect("/inicio");
    } else {
        res.redirect("/login");
    }
});

module.exports = router; 