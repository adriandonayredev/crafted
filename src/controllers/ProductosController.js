const productoModel = require("../models/producto");

// Mostrar página de productos organizados por hobbies
module.exports.mostrarProductos = async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.redirect("/login");
        }

        // Obtener todos los productos
        const todosProductos = await productoModel.find({});
        
        // Organizar productos por hobbies
        const productosPorHobby = {
            pintura: [],
            escultura: [],
            fotografia: [],
            musica: [],
            dibujo: [],
            otros: []
        };

        // Clasificar productos por hobby basado en el nombre y descripción
        todosProductos.forEach(producto => {
            const nombre = producto.nombre.toLowerCase();
            const descripcion = producto.descripcion.toLowerCase();
            
            if (nombre.includes('pincel') || nombre.includes('acuarela') || 
                nombre.includes('óleo') || nombre.includes('acrílico') || 
                nombre.includes('lienzo') || descripcion.includes('pintura')) {
                productosPorHobby.pintura.push(producto);
            } else if (nombre.includes('arcilla') || nombre.includes('esculpir') || 
                       nombre.includes('modelado') || descripcion.includes('escultura')) {
                productosPorHobby.escultura.push(producto);
            } else if (nombre.includes('cámara') || nombre.includes('fotografía') || 
                       nombre.includes('revelado') || descripcion.includes('foto')) {
                productosPorHobby.fotografia.push(producto);
            } else if (nombre.includes('guitarra') || nombre.includes('teclado') || 
                       nombre.includes('micrófono') || nombre.includes('auricular') || 
                       nombre.includes('pedal') || descripcion.includes('música')) {
                productosPorHobby.musica.push(producto);
            } else if (nombre.includes('carboncillo') || nombre.includes('papel') || 
                       nombre.includes('tableta') || descripcion.includes('dibujo')) {
                productosPorHobby.dibujo.push(producto);
            } else {
                productosPorHobby.otros.push(producto);
            }
        });

        // Limitar a 8 productos por hobby (excepto otros)
        Object.keys(productosPorHobby).forEach(hobby => {
            if (hobby !== 'otros') {
                productosPorHobby[hobby] = productosPorHobby[hobby].slice(0, 8);
            }
        });

        res.render("productos", {
            usuario: req.session.usuario,
            productosPorHobby,
            error: null
        });

    } catch (error) {
        console.log("Error al mostrar productos:", error);
        res.render("productos", {
            usuario: req.session.usuario,
            productosPorHobby: {},
            error: "Error al cargar los productos"
        });
    }
}; 