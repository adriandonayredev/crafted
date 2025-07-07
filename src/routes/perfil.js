const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    console.log('🔐 Verificando autenticación para:', req.url);
    console.log('📋 Session usuario:', req.session.usuario);
    
    if (!req.session.usuario) {
        console.log('❌ No autenticado, redirigiendo a login');
        return res.redirect('/login');
    }
    
    console.log('✅ Usuario autenticado, continuando');
    next();
};

// Rutas del perfil
console.log('🚀 Registrando rutas de perfil:');
console.log('   GET /perfil/ -> mostrarPerfil');
console.log('   POST /perfil/actualizar -> actualizarPerfil');
console.log('   POST /perfil/cambiar-password -> cambiarPassword');

router.get('/', requireAuth, PerfilController.mostrarPerfil);
router.post('/actualizar', requireAuth, PerfilController.actualizarPerfil);
router.post('/cambiar-password', requireAuth, PerfilController.cambiarPassword);

module.exports = router; 