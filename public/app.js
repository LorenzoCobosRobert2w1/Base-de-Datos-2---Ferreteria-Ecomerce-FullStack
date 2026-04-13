// ESTADO GLOBAL
let allProducts = [];
let allCustomers = [];
let cart = [];
let charts = {};

// SELECTORES
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-sidebar');
const navItems = document.querySelectorAll('.nav-item');
const subMenuLinks = document.querySelectorAll('.submenu-item');
const sections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('current-section-title');

/** 1. NAVEGACIÓN **/
toggleBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.classList.contains('has-submenu')) {
            e.preventDefault();
            const targetSub = document.getElementById(item.getAttribute('data-target'));
            if (targetSub) targetSub.classList.toggle('hidden');
        } else {
            const target = item.getAttribute('data-section');
            if (target) handleNav(target, item.innerText.trim());
        }
    });
});

subMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        handleNav(link.getAttribute('data-section'), link.innerText.trim());
    });
});

function handleNav(target, title, skipCheck = false) {
    if (!skipCheck && checkUnsaved()) {
        if (!confirm('Cambios sin guardar. ¿Salir?')) return;
        resetForms();
    }
    
    sections.forEach(s => {
        s.classList.add('hidden');
        if (s.id === target) s.classList.remove('hidden');
    });
    
    sectionTitle.textContent = title;

    if (target === 'section-inicio') loadStats();
    if (target === 'section-inventory') loadProducts();
    if (target === 'section-customers-list') loadCustomers();
    if (target === 'section-pos') { loadProducts(); loadCustomers(); }
}

function checkUnsaved() {
    const pF = document.getElementById('productForm');
    const cF = document.getElementById('customerForm');
    const hasData = (f) => f && Array.from(f.elements).some(el => 
        ['text','number','url'].includes(el.type) && el.value.trim() !== '' && el.name !== '_id'
    );
    return hasData(pF) || hasData(cF);
}

function resetForms() {
    document.getElementById('productForm')?.reset();
    document.getElementById('customerForm')?.reset();
    if (document.getElementById('edit-product-id')) document.getElementById('edit-product-id').value = '';
    if (document.getElementById('product-form-title')) document.getElementById('product-form-title').textContent = 'Registrar Producto';
    document.getElementById('btn-cancel-product')?.classList.add('hidden');

    if (document.getElementById('edit-customer-id')) document.getElementById('edit-customer-id').value = '';
    if (document.getElementById('customer-form-title')) document.getElementById('customer-form-title').textContent = 'Nuevo Cliente';
    document.getElementById('btn-cancel-customer')?.classList.add('hidden');
}

/** 2. ESTADÍSTICAS **/
async function loadStats(startDate = '', endDate = '') {
    try {
        // Armamos la URL con las fechas si el usuario las eligió
        let url = '/api/stats';
        if (startDate && endDate) {
            url += `?start=${startDate}&end=${endDate}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        
        document.getElementById('stat-month').textContent = `$${(data.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('stat-year').textContent = data.totalSalesCount || 0;
        document.getElementById('stat-top-p').textContent = data.topProduct || '---';
        
        renderCharts(data);
    } catch (e) { console.error("Error stats:", e); }
}

// NUEVO: Escuchar el click del botón de filtrar fechas
document.getElementById('btn-filter-dates')?.addEventListener('click', () => {
    const start = document.getElementById('date-from').value;
    const end = document.getElementById('date-to').value;
    
    if (!start || !end) {
        return alert("Por favor, selecciona ambas fechas.");
    }
    
    // Llamamos a las estadísticas de nuevo, pero con el filtro
    loadStats(start, end);
});

function renderCharts(data) {
    Object.keys(charts).forEach(k => charts[k].destroy());
    const config = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        charts.line = new Chart(lineCtx, {
            type: 'line',
            data: { 
                labels: (data.lineData || []).map(d => d._id), 
                datasets: [{ label: 'Ventas ($)', data: (data.lineData || []).map(d => d.total), borderColor: '#f26522', tension: 0.4 }]
            },
            options: config
        });
    }

    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        charts.pie = new Chart(pieCtx, {
            type: 'doughnut',
            data: { 
                labels: (data.pieData || []).map(d => d._id), 
                datasets: [{ data: (data.pieData || []).map(d => d.value), backgroundColor: ['#f26522', '#007bff', '#28a745', '#ffc107'] }]
            },
            options: { ...config, plugins: { legend: { display: true, position: 'bottom' } } }
        });
    }

    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        charts.bar = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: (data.topCustomers || []).map(c => c._id || 'Anónimo'),
                datasets: [{ label: 'Inversión ($)', data: (data.topCustomers || []).map(c => c.invertido), backgroundColor: '#007bff' }]
            },
            options: config
        });
    }
}

/** 3. PRODUCTOS **/
async function loadProducts() {
    try {
        const res = await fetch('/api/productos');
        allProducts = await res.json();
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        grid.innerHTML = allProducts.map(p => `
            <div class="product-card">
                <div class="product-img-container">
                    <img src="${p.imagen_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" class="product-img">
                    <span class="stock-badge">${p.stock} disponibles</span>
                </div>
                <div class="product-info">
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600">${p.marca}</span>
                    <h3>${p.nombre}</h3>
                    <span class="price-tag">$${parseFloat(p.precio).toFixed(2)}</span>
                    <div class="product-actions">
                        <button onclick="prepareEdit('${p._id}')" class="btn-secondary" style="flex:1"><i class="bi bi-pencil"></i></button>
                        <button onclick="deleteProductUI('${p._id}')" class="btn-secondary" style="flex:1; color:#dc3545"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
        renderPOS();
    } catch (e) { console.error("Error productos:", e); }
}

window.prepareEdit = (id) => {
    const p = allProducts.find(x => x._id === id);
    if (!p) return;
    handleNav('section-add', 'Editar Producto', true);
    const f = document.getElementById('productForm');
    document.getElementById('edit-product-id').value = p._id;
    f.nombre.value = p.nombre;
    f.marca.value = p.marca;
    f.precio.value = p.precio;
    f.stock.value = p.stock;
    f.imagen_url.value = p.imagen_url || '';
    f.descripcion.value = p.descripcion || '';
    document.getElementById('product-form-title').textContent = 'Editar Producto';
    document.getElementById('btn-cancel-product').classList.remove('hidden');
};

document.getElementById('btn-cancel-product')?.addEventListener('click', () => {
    resetForms();
    handleNav('section-inventory', 'Catálogo de Productos');
});

window.deleteProductUI = async (id) => {
    if (confirm('¿Dar de baja este producto?')) {
        await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        loadProducts();
    }
};

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    const id = d._id; delete d._id;
    const res = await fetch(id ? `/api/productos/${id}` : '/api/productos', {
        method: id ? 'PUT' : 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(d)
    });
    if (res.ok) { resetForms(); handleNav('section-inventory', 'Catálogo de Productos'); }
    else { const err = await res.json(); alert(err.error); }
});

/** 4. CLIENTES **/
async function loadCustomers() {
    try {
        const res = await fetch('/api/clientes');
        allCustomers = await res.json();
        const list = document.getElementById('customerList');
        if (!list) return;
        list.innerHTML = `
            <div class="customer-row header"><div>Nombre</div><div>Email</div><div>Acciones</div></div>
            ${allCustomers.map(c => `
                <div class="customer-row">
                    <div>${c.nombre_completo}</div>
                    <div>${c.email}</div>
                    <div class="product-actions" style="margin-top:0">
                        <button onclick="prepareEditCustomer('${c._id}')" class="btn-secondary"><i class="bi bi-pencil"></i></button>
                        <button onclick="deleteCustomerUI('${c._id}')" class="btn-secondary"><i class="bi bi-trash"></i></button>
                    </div>
                </div>`).join('')}
        `;
        updateCustomerSelect();
    } catch (e) { console.error("Error clientes:", e); }
}

window.prepareEditCustomer = (id) => {
    const c = allCustomers.find(x => x._id === id);
    if (!c) return;
    handleNav('section-customers-add', 'Editar Cliente', true);
    const f = document.getElementById('customerForm');
    document.getElementById('edit-customer-id').value = c._id;
    f.nombre_completo.value = c.nombre_completo;
    f.email.value = c.email;
    f.telefono.value = c.telefono || '';
    document.getElementById('customer-form-title').textContent = 'Editar Cliente';
    document.getElementById('btn-cancel-customer').classList.remove('hidden');
};

document.getElementById('btn-cancel-customer')?.addEventListener('click', () => {
    resetForms();
    handleNav('section-customers-list', 'Listado de Clientes');
});

window.deleteCustomerUI = async (id) => {
    if (confirm('¿Eliminar cliente?')) {
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        loadCustomers();
    }
};

document.getElementById('customerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    const id = d._id; delete d._id;
    const res = await fetch(id ? `/api/clientes/${id}` : '/api/clientes', { 
        method: id ? 'PUT' : 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(d) 
    });
    if (res.ok) { resetForms(); handleNav('section-customers-list', 'Listado de Clientes'); }
    else { const err = await res.json(); alert(err.error); }
});

/** 5. VENTAS (POS) **/
function renderPOS() {
    const g = document.getElementById('posGrid');
    if (!g) return;
    g.innerHTML = allProducts.filter(p => p.stock > 0).map(p => `
        <div class="pos-item-card" onclick="addToCart('${p._id}')">
            <img src="${p.imagen_url || 'https://via.placeholder.com/150?text=Sin+Imagen'}" class="pos-item-img">
            <div class="pos-item-info">
                <h4>${p.nombre}</h4>
                <p>$${parseFloat(p.precio).toFixed(2)}</p>
                <small>Stock: ${p.stock}</small>
            </div>
        </div>
    `).join('');
}

function updateCustomerSelect() {
    const s = document.getElementById('pos-customer-select');
    if (!s) return;
    s.innerHTML = '<option value="anonimo">👤 Cliente Anónimo</option>' + 
                 allCustomers.map(c => `<option value="${c._id}">${c.nombre_completo}</option>`).join('');
}

window.addToCart = (id) => {
    const p = allProducts.find(x => x._id === id);
    if (!p) return;
    const inC = cart.find(x => x.id === id);
    if (inC) {
        if (inC.cantidad + 1 > p.stock) return alert('Sin stock suficiente');
        inC.cantidad++;
    } else {
        cart.push({ id: p._id, nombre: p.nombre, precio: p.precio, cantidad: 1 });
    }
    renderCart();
};

function renderCart() {
    const c = document.getElementById('cartItems');
    if (!c) return;
    let total = 0;
    const items = cart.map(i => {
        total += i.precio * i.cantidad;
        return `<div class="cart-item animate-in"><span>${i.nombre} x${i.cantidad}</span><span>$${(i.precio*i.cantidad).toFixed(2)}</span></div>`;
    }).join('') || '<p style="text-align:center; color:var(--text-muted); padding:20px">Carrito vacío</p>';
    c.innerHTML = items;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

document.getElementById('btn-checkout')?.addEventListener('click', async () => {
    if (cart.length === 0) return alert("El carrito está vacío");
    const cId = document.getElementById('pos-customer-select').value;
    const cData = cId === 'anonimo' ? { nombre_completo: 'Anónimo' } : allCustomers.find(x => x._id === cId);
    
    try {
        const res = await fetch('/api/ordenes', { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ items: cart, cliente: cData })
        });
        if (res.ok) {
            const d = await res.json();
            showInvoice(d.factura);
            cart = []; renderCart(); loadProducts(); loadStats();
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
        }
    } catch (e) { alert('Error de conexión con el servidor.'); }
});

function showInvoice(f) {
    const details = document.getElementById('invoice-details');
    const modal = document.getElementById('modal-invoice');
    if (!details || !modal) return;
    
    const total = f.items.reduce((a, b) => a + (b.precio * b.cantidad), 0);
    details.innerHTML = `
        <p style="margin-bottom:15px; animation: slideUp 0.4s ease-out"><strong>Cliente:</strong> ${f.cliente.nombre_completo}</p>
        <div style="text-align:left; border-top:1px solid #eee; padding-top:10px; margin-bottom:15px">
            ${f.items.map((i, idx) => `<div style="display:flex; justify-content:space-between; animation: slideUp ${0.4 + (idx * 0.05)}s ease-out"><span>${i.nombre} x${i.cantidad}</span><span>$${(i.precio*i.cantidad).toFixed(2)}</span></div>`).join('')}
        </div>
        <h3 style="color:var(--primary); font-size:1.6rem; animation: scaleIn 0.5s ease-out">TOTAL: $${total.toFixed(2)}</h3>
    `;
    modal?.classList.remove('hidden');
}

window.closeModal = () => document.getElementById('modal-invoice')?.classList.add('hidden');

// INIT
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadProducts();
    loadCustomers();
});
