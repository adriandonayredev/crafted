const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

class PerfilController {
    // Mostrar página del perfil
    async mostrarPerfil(req, res) {
        console.log('🔍 Accediendo a mostrarPerfil');
        console.log('📋 Session usuario:', req.session.usuario);
        console.log('🌐 URL:', req.url);
        console.log('📝 Method:', req.method);
        
        try {
            if (!req.session.usuario) {
                console.log('❌ No hay usuario en sesión, redirigiendo a login');
                return res.redirect('/login');
            }
            
            console.log('🔍 Buscando usuario con ID:', req.session.usuario._id);
            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                console.log('❌ Usuario no encontrado en BD, redirigiendo a login');
                return res.redirect('/login');
            }
            
            console.log('✅ Usuario encontrado, renderizando perfil');
            res.render('perfil', { 
                usuario: usuario,
                error: null,
                success: null
            });
        } catch (error) {
            console.error('❌ Error al mostrar perfil:', error);
            res.render('perfil', { 
                usuario: null,
                error: 'Error al cargar el perfil',
                success: null
            });
        }
    }

    // Actualizar perfil
    async actualizarPerfil(req, res) {
        try {
            if (!req.session.usuario) {
                return res.redirect('/login');
            }
            
            const { nombre, apellido, email, experiencia, hobbies } = req.body;
            
            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                return res.redirect('/login');
            }

            // Actualizar campos básicos
            usuario.nombre = nombre;
            usuario.apellido = apellido;
            usuario.email = email;
            usuario.experiencia = experiencia;

            // Actualizar hobbies si se proporcionan
            if (hobbies && Array.isArray(hobbies)) {
                usuario.hobbies = hobbies.map((hobby, index) => ({
                    _id: index + 1,
                    nombre: hobby
                }));
            }

            await usuario.save();

            res.render('perfil', { 
                usuario: usuario,
                error: null,
                success: 'Perfil actualizado correctamente'
            });
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            const usuario = await Usuario.findById(req.session.usuario._id);
            res.render('perfil', { 
                usuario: usuario,
                error: 'Error al actualizar el perfil',
                success: null
            });
        }
    }

    // Cambiar contraseña
    async cambiarPassword(req, res) {
        try {
            if (!req.session.usuario) {
                return res.redirect('/login');
            }
            
            const { passwordActual, passwordNuevo, passwordConfirmar } = req.body;
            
            const usuario = await Usuario.findById(req.session.usuario._id);
            if (!usuario) {
                return res.redirect('/login');
            }

            // Verificar contraseña actual
            const passwordValido = await bcrypt.compare(passwordActual, usuario.password);
            if (!passwordValido) {
                return res.render('perfil', { 
                    usuario: usuario,
                    error: 'La contraseña actual es incorrecta',
                    success: null
                });
            }

            // Verificar que las nuevas contraseñas coincidan
            if (passwordNuevo !== passwordConfirmar) {
                return res.render('perfil', { 
                    usuario: usuario,
                    error: 'Las nuevas contraseñas no coinciden',
                    success: null
                });
            }

            // Encriptar nueva contraseña
            const saltRounds = 10;
            const passwordEncriptado = await bcrypt.hash(passwordNuevo, saltRounds);
            usuario.password = passwordEncriptado;

            await usuario.save();

            res.render('perfil', { 
                usuario: usuario,
                error: null,
                success: 'Contraseña cambiada correctamente'
            });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            const usuario = await Usuario.findById(req.session.usuario._id);
            res.render('perfil', { 
                usuario: usuario,
                error: 'Error al cambiar la contraseña',
                success: null
            });
        }
    }
}

module.exports = new PerfilController(); 