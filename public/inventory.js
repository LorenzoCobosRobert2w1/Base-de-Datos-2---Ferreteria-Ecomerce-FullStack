const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./db');

/**
 * Nombre de la colección en la base de datos
 */
const COLLECTION_NAME = 'productos';

/**
 * CREAR: Inserta un nuevo objeto de ferretería.
 */
async function createProduct(productData) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const product = {
    ...productData,
    precio: parseFloat(productData.precio) || 0,
    stock: parseInt(productData.stock) || 0,
    fecha_ingreso: productData.fecha_ingreso || new Date(),
    activo: productData.activo !== undefined ? productData.activo : true
  };

  const result = await collection.insertOne(product);
  console.log(`✨ Producto creado con ID: ${result.insertedId}`);
  return result.insertedId;
}

/**
 * LEER: Obtiene todos los productos activos.
 */
async function getProducts(query = {}) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const filter = { activo: true, ...query };
  return await collection.find(filter).toArray();
}

/**
 * LEER: Obtiene un producto por su ID.
 */
async function getProductById(id) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(id), activo: true });
}

/**
 * ACTUALIZAR: Modifica un producto por su ID.
 */
async function updateProduct(id, updateData) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  if (updateData.precio) updateData.precio = parseFloat(updateData.precio);
  if (updateData.stock) updateData.stock = parseInt(updateData.stock);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) throw new Error('No se encontró el producto.');
  return result.modifiedCount;
}

/**
 * BORRAR (Lógico): Desactiva un producto.
 */
async function deleteProduct(id) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { activo: false, fecha_baja: new Date() } }
  );

  if (result.matchedCount === 0) throw new Error('No se encontró el producto.');
  return result.modifiedCount;
}

/**
 * PROCESAR VENTA: Reduce el stock e inserta la venta.
 */
async function processSale(items, cliente) {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  // Verificar stock antes de ejecutar para dar un error claro
  for (const item of items) {
    const prod = await collection.findOne({ _id: new ObjectId(item.id) });
    if (!prod) throw new Error(`Producto "${item.nombre}" no encontrado en la base de datos.`);
    if (prod.stock < parseInt(item.cantidad)) {
      throw new Error(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, solicitado: ${item.cantidad}.`);
    }
  }

  const bulkOps = items.map(item => ({
    updateOne: {
      filter: { _id: new ObjectId(item.id), stock: { $gte: parseInt(item.cantidad) } },
      update: { $inc: { stock: -parseInt(item.cantidad) } }
    }
  }));

  const result = await collection.bulkWrite(bulkOps);
  
  if (result.modifiedCount !== items.length) {
    throw new Error('Stock insuficiente en uno o más productos. Intentá de nuevo.');
  }

  const salesCollection = db.collection('ventas');
  const ventaDoc = {
    items,
    cliente,
    fecha: new Date(),
    total: items.reduce((acc, i) => acc + (parseFloat(i.precio) * parseInt(i.cantidad)), 0)
  };
  await salesCollection.insertOne(ventaDoc);

  return { success: true, factura: ventaDoc };
}

/**
 * OBTENER ESTADÍSTICAS: Agregaciones para dashboard.
 */
async function getStats(start, end) {
  const db = await connectToDatabase();
  const salesCol = db.collection('ventas');
  
  const query = {};
  if (start && end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // incluir todo el día final
    query.fecha = { $gte: new Date(start), $lte: endDate };
  }

  const totalSalesCount = await salesCol.countDocuments(query);
  const totalRevenueArr = await salesCol.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]).toArray();
  const totalRevenue = totalRevenueArr.length > 0 ? totalRevenueArr[0].total : 0;
  const avgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const lineData = await salesCol.aggregate([
    { $match: query },
    { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } }, 
        total: { $sum: "$total" } 
    }},
    { $sort: { "_id": 1 } }
  ]).toArray();

  const pieData = await salesCol.aggregate([
    { $match: query },
    { $unwind: "$items" },
    { $group: { _id: "$items.nombre", value: { $sum: "$items.cantidad" } } },
    { $sort: { value: -1 } },
    { $limit: 5 }
  ]).toArray();

  const topCustomers = await salesCol.aggregate([
    { $match: query },
    { $group: { 
        _id: "$cliente.nombre_completo", 
        compras: { $sum: 1 },
        invertido: { $sum: "$total" }
    }},
    { $sort: { invertido: -1 } },
    { $limit: 5 }
  ]).toArray();

  // Ventas por día de la semana (0=Dom, 1=Lun, ..., 6=Sáb)
  const salesByWeekday = await salesCol.aggregate([
    { $match: query },
    { $group: {
        _id: { $dayOfWeek: "$fecha" },
        total: { $sum: "$total" },
        count: { $sum: 1 }
    }},
    { $sort: { "_id": 1 } }
  ]).toArray();

  // Últimas 5 ventas para la tabla de actividad reciente
  const recentSales = await salesCol.find(query)
    .sort({ fecha: -1 })
    .limit(5)
    .toArray();

  // Productos con bajo stock (stock entre 1 y 5)
  const prodCol = db.collection('productos');
  const lowStock = await prodCol.find({ activo: true, stock: { $gt: 0, $lte: 5 } })
    .sort({ stock: 1 })
    .limit(5)
    .toArray();

  return {
    totalSalesCount,
    totalRevenue,
    avgTicket,
    lineData,
    pieData,
    topCustomers,
    salesByWeekday,
    recentSales,
    lowStock,
    topProduct: pieData.length > 0 ? pieData[0]._id : 'N/A'
  };
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  processSale,
  getStats
};
