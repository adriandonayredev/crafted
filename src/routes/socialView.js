const express = require("express");
const router = express.Router();
const socialController = require("../controllers/SocialController");
const multer = require("multer");
const path = require("path");

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage });

router.get("/social", socialController.mostrarSocial);
router.post("/social/post", upload.single('imagen'), socialController.crearPost);
router.post("/social/comentario", socialController.agregarComentario);
router.post("/social/like", socialController.toggleLike);

module.exports = router; 