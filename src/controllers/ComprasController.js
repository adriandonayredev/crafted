const Compra = require('../models/compra');
const Usuario = require('../models/usuario');

class ComprasController {
    // Mostrar historial de compras del usuario
    async mostrarMisCompras(req, res) {
        try {
            const usuario = await Usuario.findById(req.session.usuarioId);
            if (!usuario) {
                return res.redirect('/login');
            }

            // Obtener todas las compras del usuario con información de productos
            const compras = await Compra.find({ usuario: req.session.usuarioId })
                .populate('productos.producto')
                .sort({ fecha: -1 }); // Más recientes primero

            res.render('mis-compras', { 
                usuario: usuario,
                compras: compras,
                error: null
            });
        } catch (error) {
            console.error('Error al mostrar compras:', error);
            const usuario = await Usuario.findById(req.session.usuarioId);
            res.render('mis-compras', { 
                usuario: usuario,
                compras: [],
                error: 'Error al cargar el historial de compras'
            });
        }
    }

    // Mostrar detalles de una compra específica
    async mostrarDetalleCompra(req, res) {
        try {
            const { compraId } = req.params;
            const usuario = await Usuario.findById(req.session.usuarioId);
            
            if (!usuario) {
                return res.redirect('/login');
            }

            const compra = await Compra.findOne({ 
                _id: compraId, 
                usuario: req.session.usuarioId 
            }).populate('productos.producto');

            if (!compra) {
                return res.redirect('/mis-compras');
            }

            res.render('detalle-compra', { 
                usuario: usuario,
                compra: compra,
                error: null
            });
        } catch (error) {
            console.error('Error al mostrar detalle de compra:', error);
            res.redirect('/mis-compras');
        }
    }

    // Obtener estadísticas de compras (para dashboard)
    async obtenerEstadisticas(req, res) {
        try {
            const usuario = await Usuario.findById(req.session.usuarioId);
            if (!usuario) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const totalCompras = await Compra.countDocuments({ usuario: req.session.usuarioId });
            const comprasConfirmadas = await Compra.countDocuments({ 
                usuario: req.session.usuarioId, 
                estado: 'Confirmada' 
            });
            const totalGastado = await Compra.aggregate([
                { $match: { usuario: req.session.usuarioId } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);

            res.json({
                totalCompras,
                comprasConfirmadas,
                totalGastado: totalGastado[0]?.total || 0
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = new ComprasController(); 