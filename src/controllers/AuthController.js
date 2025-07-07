const usuarioModel = require("../models/usuario");
const cajaTematicaModel = require("../models/cajaTematica");

// Mostrar página de login
module.exports.mostrarLogin = async (req, res) => {
    res.render("login", { error: null });
};

// Mostrar página de registro
module.exports.mostrarRegistro = async (req, res) => {
    res.render("registro", { error: null });
};

// Procesar login
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await usuarioModel.findOne({ email, password });
        
        if (usuario) {
            // Crear sesión
            req.session.usuario = {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                experiencia: usuario.experiencia
            };
            
            // Verificar si es usuario nuevo (sin caja temática)
            if (!usuario.caja_tematica) {
                res.redirect("/preferencias");
            } else {
                res.redirect("/inicio");
            }
        } else {
            res.render("login", { error: "Credenciales incorrectas" });
        }
    } catch (error) {
        console.log("Error en login:", error);
        res.render("login", { error: "Error al iniciar sesión" });
    }
};

// Procesar registro
module.exports.registro = async (req, res) => {
    try {
        const { nombre, apellido, email, password, experiencia } = req.body;
        
        // Verificar si el usuario ya existe
        const usuarioExistente = await usuarioModel.findOne({ email });
        if (usuarioExistente) {
            return res.render("registro", { error: "El email ya está registrado" });
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = new usuarioModel({
            _id: Date.now().toString(),
            nombre,
            apellido,
            email,
            password,
            experiencia,
            hobbies: [],
            suscripciones: [],
            carrito: {
                _id: Date.now().toString(),
                fecha_creacion: new Date(),
                status: "vacío",
                items: []
            }
        });
        
        await nuevoUsuario.save();
        
        // Crear sesión
        req.session.usuario = {
            _id: nuevoUsuario._id,
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
            experiencia: nuevoUsuario.experiencia
        };
        
        res.redirect("/preferencias");
    } catch (error) {
        console.log("Error en registro:", error);
        res.render("registro", { error: "Error al registrar usuario" });
    }
};

// Mostrar formulario de preferencias
module.exports.mostrarPreferencias = async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    res.render("preferencias", { error: null });
};

// Procesar preferencias y asignar caja temática
module.exports.procesarPreferencias = async (req, res) => {
    try {
        const { hobby_principal, nivel_experiencia, presupuesto } = req.body;
        
        // Determinar caja temática basada en preferencias
        let cajaRecomendada;
        
        if (hobby_principal === "pintura") {
            cajaRecomendada = nivel_experiencia === "principiante" ? "1" : "6";
        } else if (hobby_principal === "escultura") {
            cajaRecomendada = nivel_experiencia === "principiante" ? "2" : "7";
        } else if (hobby_principal === "fotografia") {
            cajaRecomendada = nivel_experiencia === "principiante" ? "3" : "9";
        } else if (hobby_principal === "musica") {
            cajaRecomendada = nivel_experiencia === "principiante" ? "5" : "10";
        } else if (hobby_principal === "dibujo") {
            cajaRecomendada = nivel_experiencia === "principiante" ? "8" : "4";
        } else {
            cajaRecomendada = "6"; // Artista Total por defecto
        }
        
        // Actualizar usuario con caja temática
        await usuarioModel.findByIdAndUpdate(req.session.usuario._id, {
            caja_tematica: cajaRecomendada,
            hobbies: [{ _id: 1, nombre: hobby_principal }]
        });
        
        res.redirect("/inicio");
    } catch (error) {
        console.log("Error al procesar preferencias:", error);
        res.render("preferencias", { error: "Error al procesar preferencias" });
    }
};

// Logout
module.exports.logout = async (req, res) => {
    req.session.destroy();
    res.redirect("/login");
}; 