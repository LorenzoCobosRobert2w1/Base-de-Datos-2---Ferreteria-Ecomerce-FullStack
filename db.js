const { MongoClient } = require('mongodb');
require('dotenv').config();

// La URL se obtiene del archivo .env para mayor seguridad
const uri = process.env.MONGODB_URI;

// Instancia del cliente de MongoDB
const client = new MongoClient(uri);

let dbConnection;

/**
 * Función para conectar a la base de datos.
 * Utiliza un patrón de Singleton para reutilizar la conexión.
 */
async function connectToDatabase() {
  try {
    // Si ya existe una conexión, la devolvemos
    if (dbConnection) return dbConnection;

    // Intentamos conectar al servidor
    console.log('⏳ Intentando conectar a MongoDB...');
    await client.connect();
    
    // Seleccionamos la base de datos (extraída de la URI o por defecto)
    dbConnection = client.db();
    
    console.log('✅ Conexión a MongoDB establecida exitosamente.');
    return dbConnection;
  } catch (error) {
    console.error('❌ Error crítico al conectar a MongoDB:', error.message);
    process.exit(1); // Finaliza el proceso si no hay conexión
  }
}

/**
 * Función para cerrar la conexión de forma segura.
 */
async function closeConnection() {
  if (client) {
    await client.close();
    console.log('🔌 Conexión a MongoDB cerrada.');
  }
}

module.exports = { connectToDatabase, closeConnection };
