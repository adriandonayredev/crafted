const postModel = require("../models/post");
const comentarioModel = require("../models/comentario");
const likeModel = require("../models/like");
const usuarioModel = require("../models/usuario");
const path = require("path");
const fs = require("fs");

// Mostrar feed social
module.exports.mostrarSocial = async (req, res) => {
    try {
        if (!req.session.usuario) return res.redirect("/login");
        // Obtener posts ordenados por fecha descendente
        const posts = await postModel.find({}).sort({ fecha: -1 });
        const postsConInfo = [];
        for (const post of posts) {
            const usuario = await usuarioModel.findById(post.id_usuario);
            const comentarios = await comentarioModel.find({ id_post: post._id });
            
            // Obtener información del usuario para cada comentario
            const comentariosConUsuario = await Promise.all(comentarios.map(async (comentario) => {
                const usuarioComentario = await usuarioModel.findById(comentario.id_usuario);
                return {
                    ...comentario.toObject(),
                    nombreUsuario: usuarioComentario ? usuarioComentario.nombre : 'Usuario'
                };
            }));
            
            const likes = await likeModel.find({ id_post: post._id });
            const yaDioLike = likes.some(l => l.id_usuario === req.session.usuario._id);
            postsConInfo.push({
                ...post.toObject(),
                usuario: usuario ? usuario.nombre : 'Usuario',
                comentarios: comentariosConUsuario,
                numLikes: likes.length,
                yaDioLike,
                fechaFormateada: post.fecha.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })
            });
        }
        res.render("social", {
            usuario: req.session.usuario,
            posts: postsConInfo,
            error: null
        });
    } catch (error) {
        res.render("social", {
            usuario: req.session.usuario,
            posts: [],
            error: "Error al cargar la sección social"
        });
    }
};

// Crear nuevo post (foto + comentario)
module.exports.crearPost = async (req, res) => {
    try {
        if (!req.session.usuario) return res.redirect("/login");
        const { comentario } = req.body;
        let imagen_url = "";
        if (req.file) {
            imagen_url = "/uploads/" + req.file.filename;
        }
        const nuevoPost = new postModel({
            _id: Date.now().toString(),
            id_usuario: req.session.usuario._id,
            imagen_url,
            comentario,
            fecha: new Date()
        });
        await nuevoPost.save();
        res.redirect("/social");
    } catch (error) {
        res.redirect("/social");
    }
};

// Comentar post
module.exports.agregarComentario = async (req, res) => {
    try {
        if (!req.session.usuario) return res.redirect("/login");
        const { id_post, texto } = req.body;
        const nuevoComentario = new comentarioModel({
            _id: Date.now().toString(),
            id_post,
            id_usuario: req.session.usuario._id,
            texto,
            fecha: new Date()
        });
        await nuevoComentario.save();
        res.redirect("/social");
    } catch (error) {
        res.redirect("/social");
    }
};

// Like/Unlike post
module.exports.toggleLike = async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ error: "No autenticado" });
        const { id_post } = req.body;
        const likeExistente = await likeModel.findOne({ id_post, id_usuario: req.session.usuario._id });
        if (likeExistente) {
            await likeModel.deleteOne({ _id: likeExistente._id });
            return res.json({ liked: false });
        } else {
            const nuevoLike = new likeModel({
                _id: Date.now().toString(),
                id_post,
                id_usuario: req.session.usuario._id
            });
            await nuevoLike.save();
            return res.json({ liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al dar like" });
    }
}; 