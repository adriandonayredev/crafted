const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const ComentarioPost = require("../models/comentario");
const LikePost = require("../models/like");
const Usuario = require("../models/usuario");

// Obtener todos los posts con paginación
router.get("/", async (req, res) => {
  try {
    const { limite = 10, pagina = 1, usuario, tags } = req.query;

    const filtros = { activo: true };

    if (usuario) {
      filtros.id_usuario = usuario;
    }

    if (tags) {
      const tagsArray = tags.split(',');
      filtros.tags = { $in: tagsArray };
    }

    const posts = await Post.find(filtros)
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .lean();

    // Agregar información del usuario y estadísticas
    const postsConInfo = await Promise.all(posts.map(async (post) => {
      const usuario = await Usuario.findOne({ _id: post.id_usuario }).select("nombre apellido");
      const totalComentarios = await ComentarioPost.countDocuments({ id_post: post._id, activo: true });
      const totalLikes = await LikePost.countDocuments({ id_post: post._id });

      return {
        ...post,
        usuario,
        totalComentarios,
        totalLikes
      };
    }));

    const total = await Post.countDocuments(filtros);

    res.json({
      posts: postsConInfo,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo post
router.post("/", async (req, res) => {
  try {
    const { id_usuario, titulo, contenido, imagen_url, tags } = req.body;

    if (!id_usuario || !titulo || !contenido) {
      return res.status(400).json({ error: "Usuario, título y contenido son requeridos" });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findOne({ _id: id_usuario });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const post = new Post({
      _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      id_usuario,
      titulo,
      contenido,
      imagen_url,
      tags: tags || []
    });

    await post.save();

    res.status(201).json({
      message: "Post creado exitosamente",
      post
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener post por ID con comentarios y likes
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Obtener información del usuario
    const usuario = await Usuario.findOne({ _id: post.id_usuario }).select("nombre apellido");

    // Obtener comentarios
    const comentarios = await ComentarioPost.find({ id_post: id, activo: true })
      .sort({ fecha: -1 })
      .lean();

    // Agregar información del usuario a cada comentario
    const comentariosConUsuario = await Promise.all(comentarios.map(async (comentario) => {
      const usuarioComentario = await Usuario.findOne({ _id: comentario.id_usuario }).select("nombre apellido");
      return {
        ...comentario,
        usuario: usuarioComentario
      };
    }));

    // Obtener likes
    const likes = await LikePost.find({ id_post: id });
    const totalLikes = likes.length;

    res.json({
      post: {
        ...post.toObject(),
        usuario,
        totalLikes
      },
      comentarios: comentariosConUsuario,
      likes: totalLikes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar post
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, titulo, contenido, imagen_url, tags } = req.body;

    const post = await Post.findOne({ _id: id, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Verificar que el usuario sea el propietario del post
    if (post.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para editar este post" });
    }

    const postActualizado = await Post.findOneAndUpdate(
      { _id: id },
      {
        titulo: titulo || post.titulo,
        contenido: contenido || post.contenido,
        imagen_url: imagen_url || post.imagen_url,
        tags: tags || post.tags
      },
      { new: true }
    );

    res.json({
      message: "Post actualizado exitosamente",
      post: postActualizado
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar post (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;

    const post = await Post.findOne({ _id: id, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Verificar que el usuario sea el propietario del post
    if (post.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este post" });
    }

    await Post.findOneAndUpdate(
      { _id: id },
      { activo: false }
    );

    res.json({ message: "Post eliminado exitosamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dar like a un post
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: "Usuario requerido" });
    }

    // Verificar que el post existe
    const post = await Post.findOne({ _id: id, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findOne({ _id: id_usuario });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si ya existe el like
    const likeExistente = await LikePost.findOne({ id_post: id, id_usuario });
    if (likeExistente) {
      return res.status(400).json({ error: "Ya has dado like a este post" });
    }

    const like = new LikePost({
      _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      id_post: id,
      id_usuario
    });

    await like.save();

    const totalLikes = await LikePost.countDocuments({ id_post: id });

    res.json({
      message: "Like agregado exitosamente",
      totalLikes
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Quitar like de un post
router.delete("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: "Usuario requerido" });
    }

    const like = await LikePost.findOneAndDelete({ id_post: id, id_usuario });
    if (!like) {
      return res.status(404).json({ error: "Like no encontrado" });
    }

    const totalLikes = await LikePost.countDocuments({ id_post: id });

    res.json({
      message: "Like eliminado exitosamente",
      totalLikes
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { limite = 10, pagina = 1 } = req.query;

    const posts = await Post.find({ id_usuario: id, activo: true })
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .lean();

    // Agregar estadísticas a cada post
    const postsConInfo = await Promise.all(posts.map(async (post) => {
      const totalComentarios = await ComentarioPost.countDocuments({ id_post: post._id, activo: true });
      const totalLikes = await LikePost.countDocuments({ id_post: post._id });

      return {
        ...post,
        totalComentarios,
        totalLikes
      };
    }));

    const total = await Post.countDocuments({ id_usuario: id, activo: true });

    res.json({
      posts: postsConInfo,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / parseInt(limite))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
