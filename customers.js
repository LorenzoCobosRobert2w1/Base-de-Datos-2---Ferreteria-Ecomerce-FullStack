const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./db');

/**
 * Nombre de la colección en la base de datos
 */
const COLLECTION_NAME = 'clientes';

/**
 * CREAR: Registra un nuevo cliente.
 * @param {Object} customerData - Datos del cliente (nombre, email, etc.)
 */
async function createCustomer(customerData) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const customer = {
    ...customerData,
    historial_compras: [], // Inicializamos vacío para nuevos clientes
    fecha_registro: new Date(),
    activo: true
  };

  const result = await collection.insertOne(customer);
  console.log(`👤 Cliente registrado con ID: ${result.insertedId}`);
  return result.insertedId;
}

/**
 * LEER: Obtiene la lista de clientes activos.
 * @param {Object} query - Filtros de búsqueda (ej. { email: '...' })
 */
async function getCustomers(query = {}) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const filter = { activo: true, ...query };
  const customers = await collection.find(filter).toArray();
  return customers;
}

/**
 * LEER: Obtiene un cliente por su ID.
 */
async function getCustomerById(id) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(id), activo: true });
}

/**
 * ACTUALIZAR: Modifica los datos de un cliente.
 * @param {string} id - ID del cliente.
 * @param {Object} updateData - Campos a actualizar (ej. nueva dirección).
 */
async function updateCustomer(id, updateData) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    throw new Error('No se encontró el cliente para actualizar.');
  }

  console.log(`🔄 Datos del cliente ${id} actualizados.`);
  return result.modifiedCount;
}

/**
 * BORRAR (Lógico): Desactiva la cuenta de un cliente.
 */
async function deleteCustomer(id) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { activo: false, fecha_baja: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new Error('No se encontró el cliente para desactivar.');
  }

  console.log(`🗑️ Cliente ${id} marcado como inactivo.`);
  return result.modifiedCount;
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
