# Crafted App - Backend con Capa de Presentación

## ¿Qué hay aquí?
Este repositorio contiene el backend de Crafted, una plataforma de productos y comunidad para hobbies creativos. Aquí se encuentra la API RESTful desarrollada en Node.js con Express y MongoDB, **ahora con una capa de presentación completa** que incluye:

- **API RESTful** para consumo de datos
- **Interfaz web completa** con patrón MVC
- **Gestión de productos** con CRUD completo
- **Diseño responsive** y moderno

---

## ⚙️ Requisitos

- [Docker](https://www.docker.com/products/docker-desktop) y [Docker Compose](https://docs.docker.com/compose/)
- Node.js (solo si deseas correr el backend fuera de Docker)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (opcional, solo para visualizar la base de datos)

---

## 🚀 Levantando el backend y la base de datos

1. **Clona este repositorio:**
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd <NOMBRE-DE-LA-CARPETA>
    ```

2. **Asegúrate de NO tener `node_modules` en el repositorio.**  
   Si accidentalmente hiciste commit, ejecuta:
    ```bash
    echo node_modules/ >> .gitignore
    git rm -r --cached node_modules
    git commit -m "Remove node_modules from repo"
    git push
    ```

3. **Levanta los contenedores:**
    ```bash
    docker-compose up --build
    ```
    Esto crea y YA conecta dos contenedores:
    - `crafted_app` (API REST Node.js + Interfaz Web)
    - `crafted_db` (base de datos MongoDB)

4. **Verifica:**
    - **Interfaz web**: [http://localhost:5001](http://localhost:5001) - Gestión de productos
    - **API REST**: [http://localhost:5001/api](http://localhost:5001/api) - Endpoints de la API
    - MongoDB se expone en: `localhost:27017` (puedes abrirlo con MongoDB Compass)

---

## 🎨 Capa de Presentación

### Características de la Interfaz Web:

- **Gestión completa de productos** (Crear, Leer, Actualizar, Eliminar)
- **Diseño responsive** con Bootstrap 5
- **Validación de formularios** en tiempo real
- **Modal para edición** de productos
- **Confirmaciones** para acciones destructivas
- **Notificaciones** de éxito/error
- **Auto-generación de IDs** para productos
- **Visualización de imágenes** con fallback

### Estructura MVC implementada:

```
src/
├── controllers/
│   └── ProductoController.js    # Lógica de negocio
├── routes/
│   ├── productos.js            # API REST
│   └── productosView.js        # Rutas de la interfaz web
├── views/
│   └── index.ejs              # Plantilla principal
├── public/
│   ├── css/
│   │   └── style.css          # Estilos personalizados
│   └── js/
│       └── code.js            # JavaScript del frontend
└── models/
    └── producto.js            # Modelo de datos
```

---

## 📦 Endpoints disponibles

### API REST (para consumo externo):
- `GET    /api/productos`           → Listar productos
- `POST   /api/productos`           → Crear producto (body en JSON)
- `PUT    /api/productos/:id`       → Actualizar producto por ID
- `DELETE /api/productos/:id`       → Eliminar producto por ID

### Interfaz Web (para usuarios):
- `GET    /`                        → Página principal con gestión de productos
- `POST   /crear`                   → Crear producto desde formulario
- `POST   /editar`                  → Actualizar producto desde modal
- `GET    /borrar/:id`              → Eliminar producto

**Ejemplo de body para POST /api/productos:**
```json
{
  "_id": "21",
  "nombre": "Kit de pintura al óleo",
  "descripcion": "Kit completo para pintura artística al óleo.",
  "precio": 29.99,
  "stock": 50,
  "imagen_url": "oleo.jpg",
  "experiencia": "intermedio"
}
```

---

## 🎯 Funcionalidades de la Interfaz

### Formulario de Creación:
- Campos para todos los atributos del producto
- Validación en tiempo real
- Auto-generación de ID si se deja vacío
- Selector de nivel de experiencia

### Tabla de Productos:
- Visualización de imágenes con fallback
- Badges de colores para stock y experiencia
- Botones de editar y eliminar
- Diseño responsive

### Modal de Edición:
- Pre-llenado automático de datos
- Validación de campos
- Confirmación de cambios

### Características Adicionales:
- **Responsive design** para móviles y tablets
- **Animaciones CSS** para mejor UX
- **Notificaciones** automáticas
- **Confirmaciones** para acciones destructivas

---

## Base de datos

- MongoDB corre en el contenedor crafted_db y expone el puerto 27017
- El backend se conecta automáticamente a esta base de datos
- Si deseas cargar datos de ejemplo, puedes hacerlo desde la interfaz web o usando scripts de inserción

---

## 🛠️ Desarrollo

Para desarrollo local sin Docker:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5001`

---

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, Tablet, Mobile (responsive)
- **Sistemas**: Windows, macOS, Linux