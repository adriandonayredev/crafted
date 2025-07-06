const express = require("express");
const router = express.Router();
const ComentarioPost = require("../models/comentario");
const Post = require("../models/post");
const Usuario = require("../models/usuario");

// Obtener comentarios de un post
router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { limite = 10, pagina = 1 } = req.query;

    // Verificar que el post existe
    const post = await Post.findOne({ _id: postId, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const comentarios = await ComentarioPost.find({ id_post: postId, activo: true })
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .lean();

    // Agregar información del usuario a cada comentario
    const comentariosConUsuario = await Promise.all(comentarios.map(async (comentario) => {
      const usuario = await Usuario.findOne({ _id: comentario.id_usuario }).select("nombre apellido");
      return {
        ...comentario,
        usuario
      };
    }));

    const total = await ComentarioPost.countDocuments({ id_post: postId, activo: true });

    res.json({
      comentarios: comentariosConUsuario,
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

// Crear nuevo comentario
router.post("/", async (req, res) => {
  try {
    const { id_post, id_usuario, texto } = req.body;

    if (!id_post || !id_usuario || !texto) {
      return res.status(400).json({ error: "Post, usuario y texto son requeridos" });
    }

    // Verificar que el post existe
    const post = await Post.findOne({ _id: id_post, activo: true });
    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findOne({ _id: id_usuario });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const comentario = new ComentarioPost({
      _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      id_post,
      id_usuario,
      texto
    });

    await comentario.save();

    // Obtener información del usuario para la respuesta
    const usuarioInfo = await Usuario.findOne({ _id: id_usuario }).select("nombre apellido");

    res.status(201).json({
      message: "Comentario creado exitosamente",
      comentario: {
        ...comentario.toObject(),
        usuario: usuarioInfo
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener comentario por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await ComentarioPost.findOne({ _id: id, activo: true });
    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Obtener información del usuario
    const usuario = await Usuario.findOne({ _id: comentario.id_usuario }).select("nombre apellido");

    res.json({
      comentario: {
        ...comentario.toObject(),
        usuario
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar comentario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "Texto requerido" });
    }

    const comentario = await ComentarioPost.findOne({ _id: id, activo: true });
    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Verificar que el usuario sea el propietario del comentario
    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para editar este comentario" });
    }

    const comentarioActualizado = await ComentarioPost.findOneAndUpdate(
      { _id: id },
      { texto },
      { new: true }
    );

    // Obtener información del usuario
    const usuario = await Usuario.findOne({ _id: comentario.id_usuario }).select("nombre apellido");

    res.json({
      message: "Comentario actualizado exitosamente",
      comentario: {
        ...comentarioActualizado.toObject(),
        usuario
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar comentario (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;

    const comentario = await ComentarioPost.findOne({ _id: id, activo: true });
    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Verificar que el usuario sea el propietario del comentario
    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este comentario" });
    }

    await ComentarioPost.findOneAndUpdate(
      { _id: id },
      { activo: false }
    );

    res.json({ message: "Comentario eliminado exitosamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener comentarios del usuario
router.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { limite = 10, pagina = 1 } = req.query;

    const comentarios = await ComentarioPost.find({ id_usuario: id, activo: true })
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .lean();

    // Agregar información del post a cada comentario
    const comentariosConPost = await Promise.all(comentarios.map(async (comentario) => {
      const post = await Post.findOne({ _id: comentario.id_post }).select("titulo");
      return {
        ...comentario,
        post
      };
    }));

    const total = await ComentarioPost.countDocuments({ id_usuario: id, activo: true });

    res.json({
      comentarios: comentariosConPost,
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

// Obtener estadísticas de comentarios
router.get("/estadisticas/general", async (req, res) => {
  try {
    const estadisticas = await ComentarioPost.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: null,
          totalComentarios: { $sum: 1 },
          comentariosPorDia: {
            $push: {
              fecha: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } }
            }
          }
        }
      }
    ]);

    // Contar comentarios por usuario
    const comentariosPorUsuario = await ComentarioPost.aggregate([
      { $match: { activo: true } },
      { $group: { _id: "$id_usuario", cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      estadisticas: estadisticas[0] || { totalComentarios: 0, comentariosPorDia: [] },
      usuariosMasActivos: comentariosPorUsuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
