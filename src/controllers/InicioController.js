const usuarioModel = require("../models/usuario");
const cajaTematicaModel = require("../models/cajaTematica");
const productoModel = require("../models/producto");

// Mostrar página de inicio
module.exports.mostrarInicio = async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.redirect("/login");
        }

        const usuario = await usuarioModel.findById(req.session.usuario._id);
        
        if (!usuario.caja_tematica) {
            return res.redirect("/preferencias");
        }

        // Obtener caja temática del usuario
        const cajaTematica = await cajaTematicaModel.findById(usuario.caja_tematica);
        
        if (!cajaTematica) {
            return res.render("inicio", { 
                usuario: req.session.usuario,
                cajaTematica: null,
                productosCaja: [],
                error: "No se encontró la caja temática"
            });
        }

        // Obtener productos de la caja temática
        const productosCaja = [];
        for (const productoRef of cajaTematica.productos) {
            const producto = await productoModel.findById(productoRef.id_producto);
            if (producto) {
                productosCaja.push({
                    ...producto.toObject(),
                    cantidad: productoRef.cantidad
                });
            }
        }

        res.render("inicio", {
            usuario: req.session.usuario,
            cajaTematica,
            productosCaja,
            error: null
        });

    } catch (error) {
        console.log("Error al mostrar inicio:", error);
        res.render("inicio", {
            usuario: req.session.usuario,
            cajaTematica: null,
            productosCaja: [],
            error: "Error al cargar la página de inicio"
        });
    }
}; 