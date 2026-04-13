const { createProduct, getProducts, updateProduct, deleteProduct } = require('./inventory');
const { closeConnection } = require('./db');

async function testCRUD() {
  try {
    console.log('--- Iniciando Prueba de CRUD Inventario ---');

    // 1. Prueba de Creación
    const nuevoProducto = {
      nombre: "Taladro Inalámbrico 20V",
      descripcion: "Taladro percutor con 2 baterías de litio y maletín.",
      marca: "DeWalt",
      codigo_barras: "885911234567",
      precio: 3500.00,
      moneda: "MXN",
      stock: 10,
      categoria: ["Herramientas Eléctricas"],
      especificaciones: {
        potencia: "20V",
        tipo_bateria: "Ion-Litio"
      }
    };

    const id = await createProduct(nuevoProducto);

    // 2. Prueba de Lectura
    const lista = await getProducts();
    console.log(`📋 Productos encontrados: ${lista.length}`);
    console.log('Primer producto:', lista[0].nombre);

    // 3. Prueba de Actualización (Bajar stock)
    await updateProduct(id.toString(), { stock: 9, precio: 3450.00 });

    // 4. Prueba de Borrado Lógico
    await deleteProduct(id.toString());
    
    // Verificar que ya no aparece en la lista normal
    const listaFinal = await getProducts();
    console.log(`📋 Productos activos tras borrado: ${listaFinal.length}`);

    console.log('--- ¡Prueba de CRUD completada con éxito! ---');
  } catch (error) {
    console.error('❌ Error en el test de CRUD:', error.message);
  } finally {
    await closeConnection();
  }
}

testCRUD();
