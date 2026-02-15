// Admin Panel JavaScript

// PRODUCTS DATA
const PRODUCTS = [
    { id: 1, name: 'RG 1/144 Gundam RX-78-Gp01Fb Full Burnern', price: 450000 },
    { id: 2, name: 'MG 1/100 RX-78-2 Gundam Ver.Ka', price: 650000 },
    { id: 3, name: 'MG 1/100 Unicorn Gundam Ver.Ka', price: 925000 },
    { id: 4, name: 'MG 1/100 Sazabi Ver.Ka', price: 1549000 },
    { id: 5, name: 'MG 1/100 Wing Gundam Zero EW Ver.Ka', price: 1529000 },
    { id: 6, name: 'RG 1/144 Zeta Gundam', price: 619000 },
    { id: 7, name: 'MGEX Strike Freedom Gundam', price: 3898000 },
    { id: 8, name: 'MG 1/100 Nu Gundam Ver. Ka', price: 1198000 },
    { id: 9, name: 'MG 1/100 Unicorn Gundam Banshee Ver.Ka', price: 969000 },
    { id: 10, name: 'MG 1/100 Narrative Gundam C-Packs Ver.Ka', price: 1450000 }
];

let orders = [];
let adminLoggedIn = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    setupNavigation();
    setupOrderForm();
    renderDashboard();
});

// ADMIN LOGIN/AUTH
function checkAdminAuth() {
    const password = prompt('Masukkan password admin:');
    if (password === 'admin123') {
        adminLoggedIn = true;
        document.getElementById('admin-name').textContent = 'Admin Gunpla';
        localStorage.setItem('admin-logged-in', 'true');
        location.reload();
    } else {
        alert('Password salah!');
        window.location.href = 'Gunpla Universe.html';
    }
}

function logout() {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('admin-logged-in');
        window.location.href = 'Gunpla Universe.html';
    }
}

// LOAD DATA
function loadAdminData() {
    const isLoggedIn = localStorage.getItem('admin-logged-in');
    if (!isLoggedIn) {
        checkAdminAuth();
    }
    
    const storedOrders = localStorage.getItem('gunpla-orders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    }
    
    loadSettings();
}

function saveAdminData() {
    localStorage.setItem('gunpla-orders', JSON.stringify(orders));
    renderDashboard();
    renderOrdersList();
    updateReceiptSelect();
}

// NAVIGATION
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            // Show selected section
            document.getElementById(section).classList.add('active');
        });
    });
}

// ORDER FORM SETUP
function setupOrderForm() {
    // Render products
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    
    PRODUCTS.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 100px 100px; gap: 10px; margin-bottom: 10px; align-items: center;';
        productDiv.innerHTML = `
            <div>
                <label>${product.name}</label>
                <p style="font-size: 0.9rem; color: #666;">${formatPrice(product.price)}</p>
            </div>
            <input type="number" id="product-qty-${product.id}" value="0" min="0" style="padding: 8px; border: 1px solid #ddd;">
            <input type="text" value="${formatPrice(product.price)}" readonly style="padding: 8px; background-color: #f0f0f0;">
        `;
        productsList.appendChild(productDiv);
    });

    // Form submit
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createOrder();
    });
}

function createOrder() {
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerAddress = document.getElementById('customer-address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const orderNotes = document.getElementById('order-notes').value;

    // Get selected products
    const items = [];
    let total = 0;

    PRODUCTS.forEach(product => {
        const qty = parseInt(document.getElementById(`product-qty-${product.id}`).value) || 0;
        if (qty > 0) {
            items.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                qty: qty,
                subtotal: product.price * qty
            });
            total += product.price * qty;
        }
    });

    if (items.length === 0) {
        alert('Pilih minimal satu produk!');
        return;
    }

    // Add shipping and tax
    const shipping = 50000;
    const tax = Math.round(total * 0.1);
    const grandTotal = total + shipping + tax;

    const order = {
        id: 'GU-' + Date.now(),
        orderNumber: orders.length + 1,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: items,
        subtotal: total,
        shipping: shipping,
        tax: tax,
        total: grandTotal,
        paymentMethod: paymentMethod,
        notes: orderNotes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(order);
    saveAdminData();

    // Reset form
    document.getElementById('order-form').reset();
    document.getElementById('create-order').innerHTML = '<div class="alert alert-success">✅ Pesanan berhasil dibuat! ID: ' + order.id + '</div>' + document.getElementById('create-order').innerHTML;

    setTimeout(() => {
        location.reload();
    }, 2000);
}

// DASHBOARD
function renderDashboard() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('total-revenue').textContent = formatPrice(totalRevenue);

    // Recent orders
    const recentOrders = orders.slice(-5).reverse();
    const recentOrdersHtml = recentOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.items[0].productName}${order.items.length > 1 ? ' +' + (order.items.length - 1) : ''}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
            <td>
                <button class="btn action-btn btn-secondary" onclick="editOrderStatus('${order.id}')">Edit</button>
                <button class="btn action-btn btn-danger" onclick="deleteOrder('${order.id}')">Hapus</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('recent-orders').innerHTML = recentOrdersHtml || '<tr><td colspan="6" style="text-align: center; color: #999;">Belum ada pesanan</td></tr>';
    
    // Update analytics on dashboard
    updateAnalytics();
    renderStockList();
}

// ORDERS LIST
function renderOrdersList() {
    const ordersList = document.getElementById('orders-list');
    const searchTerm = document.getElementById('search-order').value.toLowerCase();

    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm)
    );

    const ordersHtml = filteredOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.items.map(i => i.productName).join(', ')}</td>
            <td>${formatPrice(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
            <td>
                <button class="btn action-btn btn-secondary" onclick="editOrderStatus('${order.id}')">Edit</button>
                <button class="btn action-btn" onclick="generateReceipt('${order.id}')">Bukti</button>
                <button class="btn action-btn btn-danger" onclick="deleteOrder('${order.id}')">Hapus</button>
            </td>
        </tr>
    `).join('');

    ordersList.innerHTML = ordersHtml || '<tr><td colspan="7" style="text-align: center; color: #999;">Belum ada pesanan</td></tr>';
}

function editOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    const newStatus = prompt('Status baru (pending/confirmed/shipped/delivered):', order.status);
    
    if (newStatus && ['pending', 'confirmed', 'shipped', 'delivered'].includes(newStatus)) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        saveAdminData();
        alert('✅ Status pesanan diperbarui!');
    }
}

function deleteOrder(orderId) {
    if (confirm('Yakin ingin menghapus pesanan ini?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveAdminData();
        alert('✅ Pesanan dihapus!');
    }
}

// RECEIPT GENERATION
function updateReceiptSelect() {
    const select = document.getElementById('receipt-order-select');
    select.innerHTML = '<option value="">-- Pilih Pesanan --</option>' + 
        orders.map(order => `<option value="${order.id}">${order.id} - ${order.customerName}</option>`).join('');
}

function previewReceipt() {
    const orderId = document.getElementById('receipt-order-select').value;
    if (!orderId) {
        alert('Pilih pesanan terlebih dahulu!');
        return;
    }
    
    const order = orders.find(o => o.id === orderId);
    const receiptHTML = generateReceiptHTML(order);
    
    document.getElementById('receipt-preview').innerHTML = receiptHTML;
    document.getElementById('receipt-modal').classList.add('active');
}

function generateReceiptHTML(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.qty}</td>
            <td style="text-align: right;">${formatPrice(item.price)}</td>
            <td style="text-align: right; font-weight: bold;">${formatPrice(item.subtotal)}</td>
        </tr>
    `).join('');

    return `
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; font-family: Arial; border: 2px solid #333;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #ff4500; margin: 0; font-size: 2rem;">🚀 Gunpla Universe 🚀</h1>
                <p style="color: #666; margin: 5px 0;">Toko Resmi Gundam Plastic Model Kit</p>
                <p style="color: #666; margin: 0;"><strong>Bukti Pembelian / Invoice</strong></p>
            </div>

            <div style="text-align: center; margin-bottom: 20px; font-weight: bold;">
                <p>Nomor Bukti: <strong>${order.id}</strong></p>
                <p>Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 0.9rem;">
                <div>
                    <h3 style="color: #ff4500; margin-bottom: 10px;">Data Pembeli</h3>
                    <p><strong>${order.customerName}</strong></p>
                    <p>Email: ${order.customerEmail}</p>
                    <p>Telepon: ${order.customerPhone}</p>
                    <p>Alamat: ${order.customerAddress}</p>
                </div>
                <div>
                    <h3 style="color: #ff4500; margin-bottom: 10px;">Informasi Transaksi</h3>
                    <p>Metode Pembayaran: ${order.paymentMethod}</p>
                    <p>Status: ${order.status.toUpperCase()}</p>
                    <p>Dibuat: ${new Date(order.createdAt).toLocaleDateString('id-ID')} ${new Date(order.createdAt).toLocaleTimeString('id-ID')}</p>
                </div>
            </div>

            <div style="border: 1px solid #ddd; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f9f9f9; border-bottom: 2px solid #333;">
                            <th style="padding: 10px; text-align: left;">Produk</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Harga</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>

            <div style="text-align: right; margin-bottom: 20px;">
                <p style="margin: 5px 0;">Subtotal: <strong>${formatPrice(order.subtotal)}</strong></p>
                <p style="margin: 5px 0;">Biaya Pengiriman: <strong>${formatPrice(order.shipping)}</strong></p>
                <p style="margin: 5px 0;">Pajak (10%): <strong>${formatPrice(order.tax)}</strong></p>
                <p style="margin: 10px 0; padding-top: 10px; border-top: 1px solid #ccc; font-size: 1.2rem;">
                    TOTAL PEMBAYARAN: <strong style="color: #ff4500;">${formatPrice(order.total)}</strong>
                </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px dotted #ccc;">
                <p style="margin: 10px 0; color: #ff4500; font-weight: bold;">Terima Kasih Atas Pembelian Anda!</p>
                <p style="color: #666; font-size: 0.9rem;">Pesanan Anda akan segera diproses dan dikirimkan dalam 2-3 hari kerja.</p>
                <p style="color: #666; font-size: 0.8rem; margin-top: 10px;">Gunpla Universe © 2026 | www.gunplauniverse.com</p>
            </div>
        </div>
    `;
}

function downloadReceipt() {
    alert('Fitur download PDF akan segera tersedia. Untuk sekarang, gunakan Print → Save as PDF dari browser Anda.');
}

function shareReceipt() {
    const orderId = document.getElementById('receipt-order-select').value;
    if (!orderId) {
        alert('Pilih pesanan terlebih dahulu!');
        return;
    }
    
    const order = orders.find(o => o.id === orderId);
    const message = `Bukti Pembelian Anda:%0A%0ANo: ${order.id}%0ANama: ${order.customerName}%0ATotal: ${formatPrice(order.total)}%0AStatus: ${order.status}%0A%0ATerima kasih telah berbelanja di Gunpla Universe!`;
    
    window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
}

function generateReceipt(orderId) {
    document.getElementById('receipt-order-select').value = orderId;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="receipt"]').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('receipt').classList.add('active');
    previewReceipt();
}

// SETTINGS
function loadSettings() {
    document.getElementById('store-name').value = localStorage.getItem('store-name') || 'Gunpla Universe';
    document.getElementById('store-phone').value = localStorage.getItem('store-phone') || '6281392068116';
    document.getElementById('store-email').value = localStorage.getItem('store-email') || 'info@gunplauniverse.com';
    document.getElementById('store-address').value = localStorage.getItem('store-address') || 'Jl. Mobile Suit, Jakarta, Indonesia';
}

function saveSettings() {
    localStorage.setItem('store-name', document.getElementById('store-name').value);
    localStorage.setItem('store-phone', document.getElementById('store-phone').value);
    localStorage.setItem('store-email', document.getElementById('store-email').value);
    localStorage.setItem('store-address', document.getElementById('store-address').value);
    alert('✅ Pengaturan berhasil disimpan!');
}

function clearAllData() {
    if (confirm('⚠️ HATI-HATI! Ini akan menghapus SEMUA data pesanan. Lanjutkan?')) {
        if (confirm('Benar-benar yakin? Tindakan ini tidak bisa dibatalkan!')) {
            orders = [];
            localStorage.removeItem('gunpla-orders');
            localStorage.removeItem('admin-logged-in');
            alert('✅ Semua data telah dihapus. Silakan login ulang.');
            window.location.href = 'Gunpla Universe.html';
        }
    }
}

// STOCK MANAGEMENT
function renderStockList() {
    const stockList = document.getElementById('stock-list');
    if (!stockList) return;
    
    let stockData = {};
    
    // Get stock from orders
    PRODUCTS.forEach(product => {
        stockData[product.id] = {
            name: product.name,
            stock: 50, // Default stock
            sold: 0
        };
    });
    
    // Count sold items
    orders.forEach(order => {
        order.items.forEach(item => {
            if (stockData[item.productId]) {
                stockData[item.productId].sold += item.qty;
            }
        });
    });
    
    // Load saved stock from localStorage
    const savedStock = JSON.parse(localStorage.getItem('product-stock') || '{}');
    Object.assign(stockData, savedStock);
    
    const stockHtml = PRODUCTS.map(product => {
        const data = stockData[product.id];
        return `
            <tr>
                <td>${data.name}</td>
                <td>
                    <input type="number" value="${data.stock}" min="0" onchange="updateProductStock(${product.id}, this.value)" style="width: 70px;">
                </td>
                <td>${data.sold}</td>
                <td>
                    <button class="btn action-btn btn-secondary" onclick="updateProductStock(${product.id}, parseInt(document.querySelector('input[value=\\'${data.stock}\\']').value))">Simpan</button>
                </td>
            </tr>
        `;
    }).join('');
    
    stockList.innerHTML = stockHtml;
}

function updateProductStock(productId, newStock) {
    let stockData = JSON.parse(localStorage.getItem('product-stock') || '{}');
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (product) {
        let sold = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId === productId) {
                    sold += item.qty;
                }
            });
        });
        
        stockData[productId] = {
            name: product.name,
            stock: parseInt(newStock),
            sold: sold
        };
        
        localStorage.setItem('product-stock', JSON.stringify(stockData));
        showNotification('✅ Stok produk diperbarui!');
        renderStockList();
    }
}

// ANALYTICS
function updateAnalytics() {
    // Calculate conversion rate
    const sessionViews = 100; // Default estimate
    const conversionRate = orders.length > 0 ? Math.round((orders.length / sessionViews) * 100) : 0;
    document.getElementById('conversion-rate').textContent = conversionRate + '%';
    
    // Average order value
    const avgOrderValue = orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length) : 0;
    document.getElementById('avg-order-value').textContent = formatPrice(avgOrderValue);
    
    // Top product
    let productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.productName] = (productSales[item.productName] || 0) + item.qty;
        });
    });
    
    const topProduct = Object.keys(productSales).length > 0 
        ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
        : 'N/A';
    document.getElementById('top-product').textContent = topProduct.length > 20 ? topProduct.substring(0, 20) + '...' : topProduct;
    
    // Repeat customers
    let customerCount = {};
    orders.forEach(order => {
        customerCount[order.customerPhone] = (customerCount[order.customerPhone] || 0) + 1;
    });
    const repeatCustomers = Object.values(customerCount).filter(count => count > 1).length;
    document.getElementById('repeat-customers').textContent = repeatCustomers;
    
    // Top products table
    let productRevenue = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productRevenue[item.productName]) {
                productRevenue[item.productName] = { qty: 0, revenue: 0 };
            }
            productRevenue[item.productName].qty += item.qty;
            productRevenue[item.productName].revenue += item.subtotal;
        });
    });
    
    const topProductsHtml = Object.entries(productRevenue)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5)
        .map(([name, data]) => `
            <tr>
                <td>${name}</td>
                <td>${data.qty}</td>
                <td>${formatPrice(data.revenue)}</td>
            </tr>
        `).join('');
    
    document.getElementById('top-products-list').innerHTML = topProductsHtml || '<tr><td colspan="3">Tidak ada data</td></tr>';
    
    // Conversion funnel
    const statusCounts = {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };
    
    const funnelHtml = Object.entries(statusCounts).map(([status, count]) => {
        const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
        return `
            <tr>
                <td>${status.toUpperCase()}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('conversion-funnel').innerHTML = funnelHtml;
}

// MODAL
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// UTILITIES
function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-order');
    if (searchInput) {
        searchInput.addEventListener('keyup', renderOrdersList);
    }
});
