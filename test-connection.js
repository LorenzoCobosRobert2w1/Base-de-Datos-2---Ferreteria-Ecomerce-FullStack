const { connectToDatabase, closeConnection } = require('./db');

async function test() {
  try {
    const db = await connectToDatabase();
    
    // Operación simple para validar: Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log('📂 Colecciones actuales:', collections.map(c => c.name));
    
    console.log('🚀 ¡Prueba de conexión exitosa!');
  } catch (err) {
    console.error('⚠️ Falló la prueba de conexión:', err);
  } finally {
    // Siempre cerramos la conexión al terminar la prueba
    await closeConnection();
  }
}

test();
