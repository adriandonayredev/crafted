const usuarioModel = require("../models/usuario");
const productoModel = require("../models/producto");
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
    console.log("Procesando compra para usuario:", req.session.usuario._id);
    console.log("Datos recibidos:", { metodoPago, direccionEnvio });
    
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    if (!usuario) {
        console.error("Usuario no encontrado");
        return res.redirect("/login");
    }
    
    const carrito = usuario.carrito || { items: [] };
    console.log("Carrito del usuario:", carrito);
    
    if (carrito.items.length === 0) {
        console.log("Carrito vacío");
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

        console.log("Total calculado:", total);
        console.log("Items detallados:", itemsDetallados);

        // Crear compra usando el modelo correcto
        const compra = new compraModel({
            usuario: usuario._id.toString(),
            productos: itemsDetallados.map(item => ({
                producto: item.producto._id.toString(),
                cantidad: item.cantidad,
                precioUnitario: item.producto.precio
            })),
            total: total,
            metodoPago: metodoPago,
            estado: 'Confirmada'
        });
        
        console.log("Compra a crear:", compra);
        await compra.save();
        console.log("Compra guardada exitosamente:", compra._id);

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

        console.log("Compra procesada exitosamente, redirigiendo a confirmación");
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
    const compra = await compraModel.findById(idCompra).populate('productos.producto');
    
    if (!compra || compra.usuario !== req.session.usuario._id.toString()) {
        return res.redirect("/inicio");
    }

    res.render("confirmacion", {
        usuario: req.session.usuario,
        compra
    });
};

// Mostrar historial de compras
module.exports.mostrarHistorial = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    
    const compras = await compraModel.find({ usuario: req.session.usuario._id.toString() })
        .populate('productos.producto')
        .sort({ fecha: -1 });

    res.render("mis-compras", {
        usuario: req.session.usuario,
        compras,
        error: null
    });
}; 