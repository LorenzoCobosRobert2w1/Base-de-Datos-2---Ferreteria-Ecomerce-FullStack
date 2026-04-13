🛠️  Ferretería Pro | Sistema de Gestión E-commerce

  Este es un sistema integral para la gestión de inventario, clientes y ventas de una ferretería. Desarrollado con una
  arquitectura Full Stack utilizando Node.js y MongoDB.

  🚀 Requisitos Previos

  Antes de comenzar, asegúrate de tener instalado:
   * Node.js (https://nodejs.org/) (Versión 18 o superior recomendada)arlos en el catálogo.

   * MongoDB (https://www.mongodb.com/try/download/community) (Local o una cuenta en MongoDB Atlas)
       * Para editar datos.


--
   2. Instalar dependencias.

   1     npm install

  ⚙️ Configuración (CRÍTICO) que das click hasta la DB

  El sistema requiere una conexión a MongoDB. Debes crear un archivo llamado .env en la raíz del proyecto y añadir tu
  cadena de conexión:
   1. Frontend (index.html + app.js):
   1. Crea el archivo .env:io y das click en "Guardar".
       * app.js detecta el evento submit, recolecta los datos y hace un fetch('/api/productos', { method: 'POST', ...
   1     touch .env
   2. Agrega el siguiente contenido (reemplaza con tus credenciales):
   1     MONGODB_URI=mongodb://localhost:27017/ferreteria_db
      Nota: Si usas MongoDB Atlas, pega la URI que te proporciona el panel.

  🏃 Ejecución del Proyecto

  Para iniciar el servidor:
   1 node server.js
  Una vez iniciado, abre tu navegador en: http://localhost:3000

  🧪  Pruebas de Funcionamiento (Opcional)

  Si deseas verificar que la conexión a la base de datos y la lógica CRUD funcionan correctamente antes de usar la
  interfaz web, puedes ejecutar los scripts de prueba:

   * Probar Inventario: node test-inventory.js
   * Probar Clientes: node test-customers.js
   * Probar Conexión: node test-connection.js

  📂 Estructura del Proyecto

   * /public: Contiene el Frontend (HTML, CSS, JS plano).
   * server.js: Punto de entrada de la API Express.
   * inventory.js / customers.js: Lógica de acceso a datos y reglas de negocio.
   * db.js: Configuración de la conexión a MongoDB (Singleton).

  🛠️  Tecnologías Utilizadas

   * Backend: Node.js, Express.js.
   * Base de Datos: MongoDB (Driver Nativo).
   * Frontend: HTML5, CSS3 (Vanilla), JavaScript (ES6+), Chart.js.# Base-de-Datos-2---Ferreteria-Ecomerce-FullStack
Leer el readme para saber como se ejecuta 
