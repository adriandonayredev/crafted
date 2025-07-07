const mongoose = require("mongoose");

// Detectar si estamos en Docker o desarrollo local
const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true';
const mongoUrl = isDocker 
    ? (process.env.MONGO_URL || "mongodb://crafted_db:27017/crafted_db")
    : "mongodb://localhost:27017/crafted_db";

console.log("🔗 Connecting to MongoDB:", mongoUrl);
console.log("🐳 Running in Docker:", isDocker);

mongoose.connect(mongoUrl)
    .then(() => console.log("✅ DB is connected to", mongoose.connection.host))
    .catch(err => console.error("❌ Error connecting to MongoDB:", err));
