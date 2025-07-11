const usuarioModel = require("../models/usuario");
const productoModel = require("../models/producto");
const ordenModel = require("../models/orden");
const compraModel = require("../models/compra");

// Mostrar checkout
module.exports.mostrarCheckout = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    const carrito = usuario.carrito || { items: [] };
    
    if (carrito.items.length === 0) {
        return res.redirect("/carrito");
    }

    // Obtener detalles de productos
    let total = 0;
    const itemsDetallados = await Promise.all((carrito.items || []).map(async item => {
        const prod = await productoModel.findById(item.id_producto);
        if (!prod) return null;
        const subtotal = prod.precio * item.cantidad;
        total += subtotal;
        return {
            ...prod.toObject(),
            cantidad: item.cantidad,
            subtotal
        };
    }));

    res.render("checkout", {
        usuario: req.session.usuario,
        items: itemsDetallados.filter(Boolean),
        total
    });
};

// Procesar compra
module.exports.procesarCompra = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    
    const { metodoPago, direccionEnvio } = req.body;
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    const carrito = usuario.carrito || { items: [] };
    
    if (carrito.items.length === 0) {
        return res.redirect("/carrito");
    }

    try {
        // Obtener detalles de productos y verificar stock
        let total = 0;
        const itemsDetallados = await Promise.all((carrito.items || []).map(async item => {
            const prod = await productoModel.findById(item.id_producto);
            if (!prod) throw new Error(`Producto ${item.id_producto} no encontrado`);
            if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.nombre}`);
            
            const subtotal = prod.precio * item.cantidad;
            total += subtotal;
            return {
                producto: prod,
                cantidad: item.cantidad,
                subtotal
            };
        }));

        // Crear orden
        const orden = new ordenModel({
            id_usuario: usuario._id,
            items: carrito.items,
            total: total,
            status: "pendiente",
            fecha_creacion: new Date()
        });
        await orden.save();

        // Crear compra
        const compra = new compraModel({
            id_usuario: usuario._id,
            id_orden: orden._id,
            total: total,
            metodo_pago: metodoPago,
            direccion_envio: direccionEnvio,
            status: "completada",
            fecha_compra: new Date()
        });
        await compra.save();

        // Actualizar stock de productos
        for (const item of itemsDetallados) {
            await productoModel.findByIdAndUpdate(item.producto._id, {
                $inc: { stock: -item.cantidad }
            });
        }

        // Vaciar carrito
        await usuarioModel.findByIdAndUpdate(usuario._id, {
            carrito: { items: [], status: "vacio" }
        });

        // Actualizar sesión
        req.session.carritoCount = 0;

        // Redirigir a confirmación
        res.redirect(`/compra/confirmacion/${compra._id}`);

    } catch (error) {
        console.error("Error procesando compra:", error);
        res.redirect("/checkout?error=" + encodeURIComponent(error.message));
    }
};

// Mostrar confirmación de compra
module.exports.mostrarConfirmacion = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    
    const { idCompra } = req.params;
    const compra = await compraModel.findById(idCompra).populate('id_orden');
    
    if (!compra || compra.id_usuario.toString() !== req.session.usuario._id) {
        return res.redirect("/inicio");
    }

    res.render("confirmacion", {
        usuario: req.session.usuario,
        compra,
        orden: compra.id_orden
    });
};

// Mostrar historial de compras
module.exports.mostrarHistorial = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    
    const compras = await compraModel.find({ id_usuario: req.session.usuario._id })
        .populate('id_orden')
        .sort({ fecha_compra: -1 });

    res.render("historial", {
        usuario: req.session.usuario,
        compras
    });
}; 