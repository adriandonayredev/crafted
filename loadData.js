const mongoose = require('mongoose');
require('./src/database');

// Importar modelos
const Producto = require('./src/models/producto');
const Usuario = require('./src/models/usuario');
const CajaTematica = require('./src/models/cajaTematica');
const Post = require('./src/models/post');
const Comentario = require('./src/models/comentario');
const Like = require('./src/models/like');

// Datos de productos
const productos = [
  { _id: "1", nombre: "Set de pinceles Artisan Pro", descripcion: "Juego de 12 pinceles premium para técnicas mixtas", precio: 15.50, stock: 100, imagen_url: "assets/img/productos/pinceles-artisan.jpg", experiencia: "principiante" },
  { _id: "2", nombre: "Bloque de arcilla natural", descripcion: "Arcilla blanca premium para modelado y escultura", precio: 8.99, stock: 200, imagen_url: "assets/img/productos/arcilla-natural.jpg", experiencia: "avanzado" },
  { _id: "3", nombre: "Acuarelas Van Gogh set básico", descripcion: "Set de 12 colores de acuarela de alta pigmentación", precio: 168.50, stock: 33, imagen_url: "assets/img/productos/acuarelas-vg.jpg", experiencia: "principiante" },
  { _id: "4", nombre: "Kit de fotografía para principiantes", descripcion: "Incluye trípode, filtros y manual básico", precio: 160.52, stock: 45, imagen_url: "assets/img/productos/kit-fotografia.jpg", experiencia: "avanzado" },
  { _id: "5", nombre: "Lienzo premium pre-estirado", descripcion: "Lienzo 100% algodón de 40x50cm para pinturas acrílicas", precio: 61.41, stock: 12, imagen_url: "assets/img/productos/lienzo-premium.jpg", experiencia: "intermedio" },
  { _id: "6", nombre: "Set completo de óleos Rembrandt", descripcion: "Caja con 24 colores de óleo profesional", precio: 199.04, stock: 14, imagen_url: "assets/img/productos/oleos-rembrandt.jpg", experiencia: "intermedio" },
  { _id: "7", nombre: "Set de carboncillos para dibujo", descripcion: "Incluye 15 piezas de diferentes durezas", precio: 27.22, stock: 3, imagen_url: "assets/img/productos/carboncillos-set.jpg", experiencia: "intermedio" },
  { _id: "8", nombre: "Caballete de estudio plegable", descripcion: "Caballete de madera ajustable hasta 180cm de altura", precio: 137.96, stock: 35, imagen_url: "assets/img/productos/caballete-estudio.jpg", experiencia: "intermedio" },
  { _id: "9", nombre: "Cámara instantánea Instax", descripcion: "Cámara para fotografía analógica instantánea", precio: 123.90, stock: 38, imagen_url: "assets/img/productos/camara-instax.jpg", experiencia: "principiante" },
  { _id: "10", nombre: "Set de herramientas para esculpir", descripcion: "Kit de 8 herramientas para modelado en arcilla", precio: 28.14, stock: 35, imagen_url: "assets/img/productos/herramientas-escultura.jpg", experiencia: "avanzado" },
  { _id: "11", nombre: "Tableta gráfica para ilustración", descripcion: "Tableta digital con lápiz sensible a la presión", precio: 142.27, stock: 34, imagen_url: "assets/img/productos/tableta-digital.jpg", experiencia: "intermedio" },
  { _id: "12", nombre: "Set de pinturas acrílicas premium", descripcion: "Caja con 36 colores de alta densidad", precio: 170.24, stock: 44, imagen_url: "assets/img/productos/acrilicos-premium.jpg", experiencia: "principiante" },
  { _id: "13", nombre: "Papel acuarela 300g texturizado", descripcion: "Bloc de 20 hojas tamaño A3 para técnicas húmedas", precio: 30.42, stock: 28, imagen_url: "assets/img/productos/papel-acuarela.jpg", experiencia: "intermedio" },
  { _id: "14", nombre: "Kit de revelado fotográfico", descripcion: "Set completo para revelado en blanco y negro", precio: 95.38, stock: 39, imagen_url: "assets/img/productos/kit-revelado.jpg", experiencia: "avanzado" },
  { _id: "15", nombre: "Set de arcilla para esculturas", descripcion: "Arcilla autofraguante de secado natural, 5kg", precio: 95.52, stock: 11, imagen_url: "assets/img/productos/arcilla-escultura.jpg", experiencia: "avanzado" },
  { _id: "16", nombre: "Teclado musical para principiantes", descripcion: "Teclado portátil de 61 teclas con altavoces integrados", precio: 180.00, stock: 18, imagen_url: "assets/img/productos/teclado-principiantes.jpg", experiencia: "principiante" },
  { _id: "17", nombre: "Micrófono de condensador", descripcion: "Micrófono profesional para grabación de estudio", precio: 92.90, stock: 22, imagen_url: "assets/img/productos/microfono-condensador.jpg", experiencia: "avanzado" },
  { _id: "18", nombre: "Guitarra acústica", descripcion: "Guitarra acústica tamaño estándar con funda incluida", precio: 210.00, stock: 12, imagen_url: "assets/img/productos/guitarra-acustica.jpg", experiencia: "intermedio" },
  { _id: "19", nombre: "Auriculares de estudio", descripcion: "Auriculares cerrados para monitoreo musical", precio: 78.50, stock: 27, imagen_url: "assets/img/productos/auriculares-estudio.jpg", experiencia: "intermedio" },
  { _id: "20", nombre: "Pedal multiefectos para guitarra", descripcion: "Pedal con 50 efectos integrados para guitarra eléctrica", precio: 130.00, stock: 8, imagen_url: "assets/img/productos/pedal-guitarra.jpg", experiencia: "avanzado" }
];

// Datos de cajas temáticas
const cajasTematicas = [
  {
    _id: "1",
    nombre: "Kit de Inicio en Pintura",
    descripcion: "Todo lo esencial para comenzar a pintar con acuarelas y óleos.",
    tema: "pintura",
    experiencia: "principiante",
    productos: [
      { id_producto: "1", cantidad: 1 },
      { id_producto: "3", cantidad: 1 },
      { id_producto: "5", cantidad: 1 }
    ]
  },
  {
    _id: "2",
    nombre: "Set Básico de Escultura",
    descripcion: "Materiales y herramientas para modelado en arcilla.",
    tema: "escultura",
    experiencia: "principiante",
    productos: [
      { id_producto: "2", cantidad: 2 },
      { id_producto: "10", cantidad: 1 }
    ]
  },
  {
    _id: "3",
    nombre: "Pack Fotografía Creativa",
    descripcion: "Cámara y accesorios para experimentar con fotografía instantánea.",
    tema: "fotografía",
    experiencia: "intermedio",
    productos: [
      { id_producto: "4", cantidad: 1 },
      { id_producto: "9", cantidad: 1 },
      { id_producto: "14", cantidad: 1 }
    ]
  },
  {
    _id: "4",
    nombre: "Caja de Dibujo Profesional",
    descripcion: "Incluye carboncillos, bloc y tableta gráfica para explorar técnicas.",
    tema: "dibujo",
    experiencia: "avanzado",
    productos: [
      { id_producto: "7", cantidad: 1 },
      { id_producto: "11", cantidad: 1 },
      { id_producto: "13", cantidad: 1 }
    ]
  },
  {
    _id: "5",
    nombre: "Música para Principiantes",
    descripcion: "Kit básico para iniciar tu aprendizaje musical.",
    tema: "música",
    experiencia: "principiante",
    productos: [
      { id_producto: "16", cantidad: 1 },
      { id_producto: "19", cantidad: 1 }
    ]
  },
  {
    _id: "6",
    nombre: "Artista Total",
    descripcion: "Para quienes exploran varias disciplinas creativas.",
    tema: "mixto",
    experiencia: "intermedio",
    productos: [
      { id_producto: "1", cantidad: 1 },
      { id_producto: "2", cantidad: 1 },
      { id_producto: "4", cantidad: 1 },
      { id_producto: "16", cantidad: 1 }
    ]
  },
  {
    _id: "7",
    nombre: "Escultura Avanzada",
    descripcion: "Arcillas y herramientas premium para escultores expertos.",
    tema: "escultura",
    experiencia: "avanzado",
    productos: [
      { id_producto: "15", cantidad: 2 },
      { id_producto: "10", cantidad: 1 }
    ]
  },
  {
    _id: "8",
    nombre: "Dibujo Creativo",
    descripcion: "Materiales para desarrollar habilidades artísticas desde cero.",
    tema: "dibujo",
    experiencia: "principiante",
    productos: [
      { id_producto: "7", cantidad: 1 },
      { id_producto: "13", cantidad: 1 }
    ]
  },
  {
    _id: "9",
    nombre: "Fotografía Experimental",
    descripcion: "Experimenta con revelado y fotografía analógica.",
    tema: "fotografía",
    experiencia: "avanzado",
    productos: [
      { id_producto: "14", cantidad: 1 },
      { id_producto: "9", cantidad: 1 }
    ]
  },
  {
    _id: "10",
    nombre: "Estudio Musical Avanzado",
    descripcion: "Instrumentos y accesorios para músicos con experiencia.",
    tema: "música",
    experiencia: "avanzado",
    productos: [
      { id_producto: "17", cantidad: 1 },
      { id_producto: "18", cantidad: 1 },
      { id_producto: "20", cantidad: 1 }
    ]
  }
];

// Datos de posts
const posts = [
  {
    _id: "1",
    id_usuario: "1",
    titulo: "Primer acuarela completada",
    contenido: "¡Terminé mi primer cuadro con el set de acuarelas Van Gogh! Gracias Crafted.",
    fecha: new Date("2024-06-10")
  },
  {
    _id: "2",
    id_usuario: "2",
    titulo: "Escultura en proceso",
    contenido: "Empezando mi nueva figura con arcilla natural. ¿Consejos?",
    fecha: new Date("2024-06-11")
  },
  {
    _id: "3",
    id_usuario: "3",
    titulo: "Fotografía instantánea",
    contenido: "La Instax es genial, aquí mi primera foto.",
    fecha: new Date("2024-06-12")
  },
  {
    _id: "4",
    id_usuario: "4",
    titulo: "Dibujando al aire libre",
    contenido: "El papel acuarela 300g es ideal para bosquejos rápidos.",
    fecha: new Date("2024-06-13")
  },
  {
    _id: "5",
    id_usuario: "5",
    titulo: "Música y creatividad",
    contenido: "Mi teclado nuevo me inspiró a componer una canción.",
    fecha: new Date("2024-06-14")
  }
];

// Datos de comentarios
const comentarios = [
  {
    _id: "1",
    id_post: "1",
    id_usuario: "2",
    texto: "¡Te quedó genial esa acuarela!",
    fecha: new Date("2024-06-11")
  },
  {
    _id: "2",
    id_post: "2",
    id_usuario: "3",
    texto: "Recomiendo usar herramientas de modelado para detalles finos.",
    fecha: new Date("2024-06-12")
  },
  {
    _id: "3",
    id_post: "3",
    id_usuario: "4",
    texto: "La fotografía instantánea es adictiva, ¡bienvenido al club!",
    fecha: new Date("2024-06-12")
  }
];

// Datos de likes
const likes = [
  { _id: "1", id_post: "1", id_usuario: "3" },
  { _id: "2", id_post: "2", id_usuario: "4" },
  { _id: "3", id_post: "3", id_usuario: "5" },
  { _id: "4", id_post: "4", id_usuario: "6" },
  { _id: "5", id_post: "5", id_usuario: "7" }
];

async function cargarDatos() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Limpiar colecciones existentes
    await Producto.deleteMany({});
    await CajaTematica.deleteMany({});
    await Post.deleteMany({});
    await Comentario.deleteMany({});
    await Like.deleteMany({});
    
    console.log('Colecciones limpiadas');
    
    // Insertar productos
    await Producto.insertMany(productos);
    console.log(`${productos.length} productos insertados`);
    
    // Insertar cajas temáticas
    await CajaTematica.insertMany(cajasTematicas);
    console.log(`${cajasTematicas.length} cajas temáticas insertadas`);
    
    // Insertar posts
    await Post.insertMany(posts);
    console.log(`${posts.length} posts insertados`);
    
    // Insertar comentarios
    await Comentario.insertMany(comentarios);
    console.log(`${comentarios.length} comentarios insertados`);
    
    // Insertar likes
    await Like.insertMany(likes);
    console.log(`${likes.length} likes insertados`);
    
    console.log('¡Datos cargados exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
    process.exit(1);
  }
}

cargarDatos(); 