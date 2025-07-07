const express = require('express');
const router = express.Router();
const ComprasController = require('../controllers/ComprasController');

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    next();
};

// Rutas de compras
router.get('/mis-compras', requireAuth, ComprasController.mostrarMisCompras);
router.get('/mis-compras/:compraId', requireAuth, ComprasController.mostrarDetalleCompra);
router.get('/api/estadisticas-compras', requireAuth, ComprasController.obtenerEstadisticas);

module.exports = router; 