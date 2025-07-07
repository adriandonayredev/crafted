const Compra = require('../models/compra');
const Usuario = require('../models/usuario');

class ComprasController {
    // Mostrar historial de compras del usuario
    async mostrarMisCompras(req, res) {
        try {
            // Verificar si el usuario está autenticado
            if (!req.session.usuario) {
                return res.redirect('/login');
            }

            // Buscar el usuario
            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                // Si no existe el usuario, limpiar la sesión y redirigir
                req.session.destroy();
                return res.redirect('/login');
            }

            // Obtener todas las compras del usuario con información de productos
            let compras = [];
            try {
                compras = await Compra.find({ usuario: req.session.usuario._id.toString() })
                    .populate('productos.producto')
                    .sort({ fecha: -1 }); // Más recientes primero
            } catch (dbError) {
                console.error('Error al consultar compras:', dbError);
                compras = [];
            }

            // Calcular estadísticas
            const totalCompras = compras.length;
            const comprasConfirmadas = compras.filter(c => c.estado === 'Confirmada').length;
            const totalGastado = compras.reduce((sum, c) => sum + (c.total || 0), 0);

            // Log de diagnóstico
            console.log({
                usuario,
                compras,
                totalCompras,
                comprasConfirmadas,
                totalGastado,
                error: null
            });

            res.render('mis-compras', { 
                usuario: usuario,
                compras: compras,
                totalCompras,
                comprasConfirmadas,
                totalGastado,
                error: null
            });
        } catch (error) {
            console.error('Error al mostrar compras:', error);
            // Intentar obtener el usuario para mostrar la página con error
            let usuario = null;
            try {
                if (req.session.usuario) {
                    usuario = await Usuario.findById(req.session.usuario._id);
                }
            } catch (userError) {
                console.error('Error al obtener usuario:', userError);
            }

            // Log de diagnóstico en error
            console.log({
                usuario,
                compras: [],
                totalCompras: 0,
                comprasConfirmadas: 0,
                totalGastado: 0,
                error: 'Error al cargar el historial de compras. Por favor, intenta de nuevo.'
            });

            res.render('mis-compras', { 
                usuario: usuario,
                compras: [],
                totalCompras: 0,
                comprasConfirmadas: 0,
                totalGastado: 0,
                error: 'Error al cargar el historial de compras. Por favor, intenta de nuevo.'
            });
        }
    }

    // Mostrar detalles de una compra específica
    async mostrarDetalleCompra(req, res) {
        console.log('🔍 Accediendo a mostrarDetalleCompra');
        console.log('📋 Session usuario:', req.session.usuario);
        console.log('🆔 Compra ID:', req.params.compraId);
        
        try {
            const { compraId } = req.params;
            
            // Verificar si el usuario está autenticado
            if (!req.session.usuario) {
                console.log('❌ No hay usuario en sesión, redirigiendo a login');
                return res.redirect('/login');
            }

            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                console.log('❌ Usuario no encontrado en BD, redirigiendo a login');
                req.session.destroy();
                return res.redirect('/login');
            }

            console.log('🔍 Buscando compra con ID:', compraId);
            const compra = await Compra.findOne({ 
                _id: compraId, 
                usuario: req.session.usuario._id.toString() 
            }).populate('productos.producto');

            if (!compra) {
                console.log('❌ Compra no encontrada, redirigiendo a mis-compras');
                return res.redirect('/mis-compras');
            }

            console.log('✅ Compra encontrada, renderizando detalle-compra');
            res.render('detalle-compra', { 
                usuario: usuario,
                compra: compra,
                error: null
            });
        } catch (error) {
            console.error('❌ Error al mostrar detalle de compra:', error);
            res.redirect('/mis-compras');
        }
    }

    // Obtener estadísticas de compras (para dashboard)
    async obtenerEstadisticas(req, res) {
        try {
            if (!req.session.usuario) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }

            // Asegurarse de comparar como string
            const usuarioId = req.session.usuario._id.toString();

            let totalCompras = 0;
            let comprasConfirmadas = 0;
            let totalGastado = 0;

            try {
                totalCompras = await Compra.countDocuments({ usuario: usuarioId });
                comprasConfirmadas = await Compra.countDocuments({ 
                    usuario: usuarioId, 
                    estado: 'Confirmada' 
                });

                const resultadoTotal = await Compra.aggregate([
                    { $match: { usuario: usuarioId } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                totalGastado = resultadoTotal[0]?.total || 0;
            } catch (dbError) {
                console.error('Error al consultar estadísticas:', dbError);
            }

            res.json({
                totalCompras,
                comprasConfirmadas,
                totalGastado
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                totalCompras: 0,
                comprasConfirmadas: 0,
                totalGastado: 0
            });
        }
    }
}

module.exports = new ComprasController(); 