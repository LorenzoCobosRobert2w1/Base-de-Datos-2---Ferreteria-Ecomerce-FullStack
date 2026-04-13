const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, processSale, getStats } = require('./inventory');
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('./customers');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// --- MIDDLEWARES DE VALIDACIÓN ---
const validateProduct = (req, res, next) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Nombre, precio y stock son campos obligatorios.' });
  }
  if (parseFloat(precio) < 0 || parseInt(stock) < 0) {
    return res.status(400).json({ error: 'Precio y stock no pueden ser negativos.' });
  }
  next();
};

const validateCustomer = (req, res, next) => {
  const { nombre_completo, email } = req.body;
  if (!nombre_completo || !email) {
    return res.status(400).json({ error: 'Nombre completo y email son campos obligatorios.' });
  }
  next();
};

// --- ESTADÍSTICAS ---
app.get('/api/stats', async (req, res) => {
  try { 
    const { start, end } = req.query;
    res.json(await getStats(start, end)); 
  } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
  try { res.json(await getProducts()); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/productos/:id', async (req, res) => {
  try { 
    const producto = await getProductById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto); 
  } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/productos', validateProduct, async (req, res) => {
  try { res.status(201).json({ id: await createProduct(req.body) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/productos/:id', async (req, res) => {
  try { res.json({ modified: await updateProduct(req.params.id, req.body) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/productos/:id', async (req, res) => {
  try { res.json({ deleted: await deleteProduct(req.params.id) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CLIENTES ---
app.get('/api/clientes', async (req, res) => {
  try { res.json(await getCustomers()); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/clientes/:id', async (req, res) => {
  try { 
    const cliente = await getCustomerById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente); 
  } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clientes', validateCustomer, async (req, res) => {
  try { res.status(201).json({ id: await createCustomer(req.body) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/clientes/:id', async (req, res) => {
  try { res.json({ modified: await updateCustomer(req.params.id, req.body) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try { res.json({ deleted: await deleteCustomer(req.params.id) }); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- VENTAS ---
app.post('/api/ordenes', async (req, res) => {
  try {
    const { items, cliente } = req.body;
    const result = await processSale(items, cliente);
    res.json({ mensaje: 'Venta exitosa', result: result.success, factura: result.factura });
  } catch (e) {
    console.error("❌ Error en venta:", e.message);
    res.status(400).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Ferretería Pro en http://localhost:${PORT}`));
