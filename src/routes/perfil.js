const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    next();
};

// Rutas del perfil
router.get('/perfil', requireAuth, PerfilController.mostrarPerfil);
router.post('/perfil/actualizar', requireAuth, PerfilController.actualizarPerfil);
router.post('/perfil/cambiar-password', requireAuth, PerfilController.cambiarPassword);

module.exports = router; 