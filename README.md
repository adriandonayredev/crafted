# Crafted App - Backend

## ¿Qué hay aquí?
Este repositorio contiene el backend de Crafted, una plataforma de productos y comunidad para hobbies creativos. Aquí se encuentra la API RESTful desarrollada en Node.js con Express y MongoDB, lista para ser consumida por la capa de presentación (frontend).

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
    - `crafted_app` (API REST Node.js)
    - `crafted_db` (base de datos MongoDB)

4. **Verifica:**
    - El backend estará en: [http://localhost:5000](http://localhost:5000)
    - MongoDB se expone en: `localhost:27017` (puedes abrirlo con MongoDB Compass)

---

## 📦 Endpoints disponibles

Estos endpoints pueden ser consumidos desde Postman o tu futuro frontend:

- `GET    /api/productos`           → Listar productos
- `POST   /api/productos`           → Crear producto (body en JSON)
- `PUT    /api/productos/:id`       → Actualizar producto por ID
- `DELETE /api/productos/:id`       → Eliminar producto por ID

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

## Base de datos

- MongoDB corre en el contenedor crafted_db y expone el puerto 27017

- El backend se conecta automáticamente a esta base de datos

- Si deseas cargar datos de ejemplo, puedes hacerlo desde Postman o usando scripts de inserción