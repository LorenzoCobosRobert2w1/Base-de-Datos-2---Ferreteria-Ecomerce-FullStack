const { createCustomer, getCustomers, updateCustomer, deleteCustomer } = require('./customers');
const { closeConnection } = require('./db');

async function testCustomerCRUD() {
  try {
    console.log('--- Iniciando Prueba de CRUD Clientes ---');

    // 1. Registro de Cliente
    const nuevoCliente = {
      nombre_completo: "Carlos Rodríguez",
      email: "carlos.rod@email.com",
      telefono: "555-0199",
      direccion_envio: {
        calle: "Ferreteros #45",
        ciudad: "Monterrey",
        cp: "64000"
      }
    };

    const id = await createCustomer(nuevoCliente);

    // 2. Consulta
    const lista = await getCustomers({ email: "carlos.rod@email.com" });
    console.log(`🔍 Cliente encontrado: ${lista[0].nombre_completo}`);

    // 3. Actualización (Cambio de teléfono)
    await updateCustomer(id.toString(), { telefono: "555-9999" });

    // 4. Borrado Lógico
    await deleteCustomer(id.toString());
    
    const listaFinal = await getCustomers();
    console.log(`👥 Total clientes activos: ${listaFinal.length}`);

    console.log('--- ¡Prueba de Clientes completada con éxito! ---');
  } catch (error) {
    console.error('❌ Error en test de clientes:', error.message);
  } finally {
    await closeConnection();
  }
}

testCustomerCRUD();
