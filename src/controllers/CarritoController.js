const usuarioModel = require("../models/usuario");
const productoModel = require("../models/producto");

// Mostrar el carrito
module.exports.mostrarCarrito = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    const carrito = usuario.carrito || { items: [] };
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
    res.render("carrito", {
        usuario: req.session.usuario,
        items: itemsDetallados.filter(Boolean),
        total
    });
};

// Agregar producto al carrito (AJAX)
module.exports.agregarAlCarrito = async (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ error: "No autenticado" });
    const { id_producto } = req.body;
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    const producto = await productoModel.findById(id_producto);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    let carrito = usuario.carrito || { items: [] };
    let item = carrito.items.find(i => i.id_producto === id_producto);
    if (item) {
        item.cantidad += 1;
    } else {
        carrito.items.push({ id_producto, nombre: producto.nombre, cantidad: 1 });
    }
    carrito.status = "activo";
    await usuarioModel.findByIdAndUpdate(usuario._id, { carrito });
    req.session.carritoCount = carrito.items.reduce((acc, i) => acc + i.cantidad, 0);
    res.json({ ok: true, count: req.session.carritoCount });
};

// Actualizar cantidad de producto
module.exports.actualizarCantidad = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    const { id_producto, cantidad } = req.body;
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    let carrito = usuario.carrito || { items: [] };
    carrito.items = carrito.items.map(item =>
        item.id_producto === id_producto ? { ...item, cantidad: parseInt(cantidad) } : item
    );
    await usuarioModel.findByIdAndUpdate(usuario._id, { carrito });
    res.redirect("/carrito");
};

// Eliminar producto del carrito
module.exports.eliminarDelCarrito = async (req, res) => {
    if (!req.session.usuario) return res.redirect("/login");
    const { id_producto } = req.body;
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    let carrito = usuario.carrito || { items: [] };
    carrito.items = carrito.items.filter(item => item.id_producto !== id_producto);
    await usuarioModel.findByIdAndUpdate(usuario._id, { carrito });
    res.redirect("/carrito");
};

// Obtener cantidad de productos en el carrito (AJAX)
module.exports.contarCarrito = async (req, res) => {
    if (!req.session.usuario) return res.json({ count: 0 });
    const usuario = await usuarioModel.findById(req.session.usuario._id);
    const carrito = usuario.carrito || { items: [] };
    const count = carrito.items.reduce((acc, i) => acc + i.cantidad, 0);
    res.json({ count });
};
