const productoModel = require("../models/producto");

// CRUD - MOSTRAR productos
module.exports.mostrar = async (req, res) => {
    try {
        const respuesta = await productoModel.find({});
        res.render("index", { productos: respuesta });
    } catch (error) {
        console.log("No se pudo encontrar los productos. Error:", error);
        res.render("index", { productos: [], error: "Error al cargar productos" });
    }
};

// CRUD - CREAR Producto
module.exports.crear = async (req, res) => {
    try {
        const newProducto = {
            _id: req.body._id,
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: parseFloat(req.body.precio),
            stock: parseInt(req.body.stock),
            imagen_url: req.body.imagen_url,
            experiencia: req.body.experiencia
        };
        const respuesta = await new productoModel(newProducto).save();
        res.redirect("/");
    } catch (error) {
        console.log("No se pudo insertar el producto. Error:", error);
        res.redirect("/");
    }
};

// CRUD - EDITAR Producto
module.exports.editar = async (req, res) => {
    try {
        const id = req.body.id_editar;
        const updateData = {
            nombre: req.body.nombre_editar,
            descripcion: req.body.descripcion_editar,
            precio: parseFloat(req.body.precio_editar),
            stock: parseInt(req.body.stock_editar),
            imagen_url: req.body.imagen_url_editar,
            experiencia: req.body.experiencia_editar
        };
        const respuesta = await productoModel.findByIdAndUpdate(id, updateData);
        res.redirect("/");
    } catch (error) {
        console.log("No se pudo actualizar el producto. Error:", error);
        res.redirect("/");
    }
};

// CRUD - ELIMINAR Producto
module.exports.borrar = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Eliminando producto con ID:", id);
        const respuesta = await productoModel.findByIdAndDelete(id);
        res.redirect("/");
    } catch (error) {
        console.log("No se pudo eliminar el producto. Error:", error);
        res.redirect("/");
    }
}; 