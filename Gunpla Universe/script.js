// Zoom Image Functions
function zoomImage(src) {
    var zoomContainer = document.getElementById('zoom-container');
    var zoomImage = document.getElementById('zoom-image');
    zoomImage.src = src;
    zoomContainer.style.display = 'flex';
}

function closeZoom() {
    var zoomContainer = document.getElementById('zoom-container');
    zoomContainer.style.display = 'none';
}

// PRODUCTS DATABASE
const PRODUCTS_DB = [
    { id: 1, name: 'RG 1/144 Gundam RX-78-Gp01Fb Full Burnern', price: 450000, category: 'RG', rating: 4.8, reviews: 24, sale: true, salePrice: 360000 },
    { id: 2, name: 'MG 1/100 RX-78-2 Gundam Ver.Ka', price: 650000, category: 'MG', rating: 4.9, reviews: 45, sale: false },
    { id: 3, name: 'MG 1/100 Unicorn Gundam Ver.Ka', price: 925000, category: 'MG', rating: 4.7, reviews: 38, sale: true, salePrice: 741000 },
    { id: 4, name: 'MG 1/100 Sazabi Ver.Ka', price: 1549000, category: 'MG', rating: 4.9, reviews: 52, sale: false },
    { id: 5, name: 'MG 1/100 Wing Gundam Zero EW Ver.Ka', price: 1529000, category: 'MG', rating: 4.8, reviews: 31, sale: true, salePrice: 1223200 },
    { id: 6, name: 'RG 1/144 Zeta Gundam', price: 619000, category: 'RG', rating: 4.6, reviews: 18, sale: false },
    { id: 7, name: 'MGEX Strike Freedom Gundam', price: 3898000, category: 'MGEX', rating: 5, reviews: 67, sale: true, salePrice: 2918500 },
    { id: 8, name: 'MG 1/100 Nu Gundam Ver. Ka', price: 1198000, category: 'MG', rating: 4.7, reviews: 29, sale: false },
    { id: 9, name: 'MG 1/100 Unicorn Gundam Banshee Ver.Ka', price: 969000, category: 'MG', rating: 4.8, reviews: 22, sale: true, salePrice: 775200 },
    { id: 10, name: 'MG 1/100 Narrative Gundam C-Packs Ver.Ka', price: 1450000, category: 'MG', rating: 4.6, reviews: 15, sale: false }
];

let wishlist = JSON.parse(localStorage.getItem('gunpla-wishlist') || '[]');
let comparisonList = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    startCountdown();
    initializeProductsControls();
    renderComparisonCheckboxes();
});

// COUNTDOWN TIMER
function startCountdown() {
    setInterval(() => {
        let now = new Date();
        let tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        let diff = tomorrow - now;
        let hours = Math.floor(diff / (1000 * 60 * 60));
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// RENDER PRODUCTS
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    const filtered = getFilteredProducts();
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Produk tidak ditemukan</div>';
        return;
    }
    
    container.innerHTML = filtered.map(product => {
        const displayPrice = product.sale ? product.salePrice : product.price;
        const isWishlisted = wishlist.includes(product.id);
        const rating = '⭐'.repeat(Math.floor(product.rating));
        
        return `
            <div class="product-item" onclick="zoomImage('images/produk ${product.id}.jpg')">
                ${product.sale ? `<div class="sale-badge">SALE<br>-${Math.round((1 - product.salePrice/product.price) * 100)}%</div>` : ''}
                <img src="images/produk ${product.id}.jpg" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    <span class="rating-stars">${rating}</span>
                    <span class="review-count">(${product.reviews})</span>
                </div>
                ${product.sale ? `<p style="color: #999;"><del>${formatPrice(product.price)}</del></p>` : ''}
                <p><strong>Harga:</strong> ${formatPrice(displayPrice)}</p>
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id}); event.stopPropagation();">
                    ${isWishlisted ? '❤️' : '🤍'} Wishlist
                </button>
                <button class="add-to-cart-btn" onclick="addToCart('${product.name}', ${displayPrice}); event.stopPropagation();">➕ Keranjang</button>
                <a href="https://wa.me/628++++++++++?text=Saya%20tertarik%20dengan%20${encodeURIComponent(product.name)}" class="buy-now-btn" onclick="event.stopPropagation();">Pesan via WhatsApp</a>
            </div>
        `;
    }).join('');
}

function getFilteredProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;
    
    return PRODUCTS_DB.filter(product => {
        // Search filter
        if (!product.name.toLowerCase().includes(searchTerm)) return false;
        
        // Category filter
        if (categoryFilter && product.category !== categoryFilter) return false;
        
        // Price filter
        if (priceFilter) {
            const [min, max] = priceFilter.split('-');
            const price = product.sale ? product.salePrice : product.price;
            if (max && (price < parseInt(min) || price > parseInt(max))) return false;
            if (!max && price < parseInt(min)) return false;
        }
        
        // Rating filter
        if (ratingFilter && product.rating < parseInt(ratingFilter)) return false;
        
        return true;
    });
}

function filterProducts() {
    renderProducts();
}

function initializeProductsControls() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterProducts);
    }
}

// WISHLIST
function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        wishlist.push(productId);
    }
    localStorage.setItem('gunpla-wishlist', JSON.stringify(wishlist));
    renderProducts();
    showNotification(wishlist.includes(productId) ? '❤️ Ditambahkan ke wishlist!' : '💔 Dihapus dari wishlist');
}

// COMPARISON
function showComparison() {
    document.getElementById('comparison-modal').style.display = 'block';
}

function closeComparison() {
    document.getElementById('comparison-modal').style.display = 'none';
}

function renderComparisonCheckboxes() {
    const container = document.getElementById('comparison-checkboxes');
    if (!container) return;
    
    container.innerHTML = PRODUCTS_DB.map(product => `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" value="${product.id}" onchange="updateComparisonList(this)">
            <span>${product.name}</span>
        </label>
    `).join('');
}

function updateComparisonList(checkbox) {
    const productId = parseInt(checkbox.value);
    
    if (checkbox.checked) {
        if (comparisonList.length < 3) {
            comparisonList.push(productId);
        } else {
            checkbox.checked = false;
            alert('Maksimal 3 produk untuk dibandingkan');
        }
    } else {
        comparisonList = comparisonList.filter(id => id !== productId);
    }
}

function renderComparison() {
    if (comparisonList.length === 0) {
        alert('Pilih minimal 1 produk untuk dibandingkan');
        return;
    }
    
    const products = PRODUCTS_DB.filter(p => comparisonList.includes(p.id));
    
    let html = '<table class="comparison-table"><thead><tr><th>Spesifikasi</th>';
    products.forEach(p => {
        html += `<th>${p.name}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Price
    html += '<tr><td><strong>Harga</strong></td>';
    products.forEach(p => {
        const price = p.sale ? p.salePrice : p.price;
        html += `<td>${formatPrice(price)}</td>`;
    });
    html += '</tr>';
    
    // Category
    html += '<tr><td><strong>Kategori</strong></td>';
    products.forEach(p => {
        html += `<td>${p.category}</td>`;
    });
    html += '</tr>';
    
    // Rating
    html += '<tr><td><strong>Rating</strong></td>';
    products.forEach(p => {
        html += `<td>${'⭐'.repeat(Math.floor(p.rating))} (${p.reviews})</td>`;
    });
    html += '</tr>';
    
    // Stock
    html += '<tr><td><strong>Stok</strong></td>';
    products.forEach(p => {
        html += `<td>Tersedia</td>`;
    });
    html += '</tr>';
    
    // Action
    html += '<tr><td><strong>Aksi</strong></td>';
    products.forEach(p => {
        const price = p.sale ? p.salePrice : p.price;
        html += `<td><button class="btn" onclick="addToCart('${p.name}', ${price})">Keranjang</button></td>`;
    });
    html += '</tr></tbody></table>';
    
    document.getElementById('comparison-result').innerHTML = html;
}

// NEWSLETTER
function subscribeNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
    
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        document.getElementById('newsletter-email').value = '';
        showNotification('✉️ Terima kasih! Anda sudah subscribe newsletter kami.');
    } else {
        showNotification('📧 Email ini sudah terdaftar.');
    }
}

// Shopping Cart Functions (existing)
let cart = [];

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            qty: 1
        });
    }
    
    updateCart();
    showNotification('Produk ditambahkan ke keranjang!');
}

function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Keranjang Anda masih kosong</p>';
        cartTotal.textContent = 'Rp 0';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="decreaseQty(${index})">-</button>
                    <span>${item.qty}</span>
                    <button onclick="increaseQty(${index})">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotal.textContent = formatPrice(total);
    }
}

function increaseQty(index) {
    cart[index].qty += 1;
    updateCart();
}

function decreaseQty(index) {
    if (cart[index].qty > 1) {
        cart[index].qty -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        cart = [];
        updateCart();
        showNotification('Keranjang sudah dikosongkan');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

function checkoutCart() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartText = cart.map(item => `${item.name} (${item.qty}x ${formatPrice(item.price)})`).join('%0A');
    const message = `Halo, saya ingin memesan:%0A%0A${cartText}%0A%0ATotal: ${formatPrice(total)}`;
    
    window.open(`https://wa.me/628++++++++++?text=${message}`, '_blank');
}

function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Chat Widget Functions
function toggleChat() {
    const chatPopup = document.getElementById('chat-popup');
    chatPopup.classList.toggle('active');
}

// Receipt Finder Functions
function toggleReceiptFinder() {
    const modal = document.getElementById('receipt-finder-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

function findReceipt() {
    const orderId = document.getElementById('receipt-search-id').value.trim();
    
    if (!orderId) {
        alert('Masukkan ID Pesanan terlebih dahulu!');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('gunpla-orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        alert('❌ Bukti pembelian tidak ditemukan. Pastikan ID Pesanan benar.');
        return;
    }

    displayReceiptModal(order);
}

function displayReceiptModal(order) {
    const receiptHTML = generateCustomerReceipt(order);
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background-color: white; padding: 20px; border-radius: 10px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; font-size: 2rem; cursor: pointer;">&times;</button>
            ${receiptHTML}
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="window.print()" style="flex: 1; background-color: #0084ff; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🖨️ Cetak</button>
                <button onclick="shareReceiptWhatsApp('${order.id}')" style="flex: 1; background-color: #25d366; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">📱 Bagikan WhatsApp</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function generateCustomerReceipt(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.qty}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(item.price)}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-bottom: 1px solid #eee;">${formatPrice(item.subtotal)}</td>
        </tr>
    `).join('');

    return `
        <div style="max-width: 600px; padding: 30px; font-family: Arial; border: 2px solid #333;">
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
                    <p>Metode Pembayaran: <strong>${order.paymentMethod}</strong></p>
                    <p>Status: <strong style="color: ${order.status === 'delivered' ? '#28a745' : '#ff9800'};">${order.status.toUpperCase()}</strong></p>
                    <p>Jam: ${new Date(order.createdAt).toLocaleTimeString('id-ID')}</p>
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

function shareReceiptWhatsApp(orderId) {
    const orders = JSON.parse(localStorage.getItem('gunpla-orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const items = order.items.map(i => `${i.productName} (${i.qty}x)`).join('%0A');
    const message = `Bukti Pembelian:%0A%0AID: ${order.id}%0ATotal: ${formatPrice(order.total)}%0A%0AProduk:%0A${items}%0A%0AStatus: ${order.status.toUpperCase()}`;
    
    window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
}

// Notification Function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            qty: 1
        });
    }
    
    updateCart();
    showNotification('Produk ditambahkan ke keranjang!');
}

function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Keranjang Anda masih kosong</p>';
        cartTotal.textContent = 'Rp 0';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="decreaseQty(${index})">-</button>
                    <span>${item.qty}</span>
                    <button onclick="increaseQty(${index})">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        `).join('');
        
        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotal.textContent = formatPrice(total);
    }
}

function increaseQty(index) {
    cart[index].qty += 1;
    updateCart();
}

function decreaseQty(index) {
    if (cart[index].qty > 1) {
        cart[index].qty -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        cart = [];
        updateCart();
        showNotification('Keranjang sudah dikosongkan');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

function checkoutCart() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartText = cart.map(item => `${item.name} (${item.qty}x ${formatPrice(item.price)})`).join('%0A');
    const message = `Halo, saya ingin memesan:%0A%0A${cartText}%0A%0ATotal: ${formatPrice(total)}`;
    
    window.open(`https://wa.me/628++++++++++?text=${message}`, '_blank');
}

function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Chat Widget Functions
function toggleChat() {
    const chatPopup = document.getElementById('chat-popup');
    chatPopup.classList.toggle('active');
}

// Receipt Finder Functions
function toggleReceiptFinder() {
    const modal = document.getElementById('receipt-finder-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

function findReceipt() {
    const orderId = document.getElementById('receipt-search-id').value.trim();
    
    if (!orderId) {
        alert('Masukkan ID Pesanan terlebih dahulu!');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('gunpla-orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        alert('❌ Bukti pembelian tidak ditemukan. Pastikan ID Pesanan benar.');
        return;
    }

    displayReceiptModal(order);
}

function displayReceiptModal(order) {
    const receiptHTML = generateCustomerReceipt(order);
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background-color: white; padding: 20px; border-radius: 10px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; font-size: 2rem; cursor: pointer;">&times;</button>
            ${receiptHTML}
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="window.print()" style="flex: 1; background-color: #0084ff; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🖨️ Cetak</button>
                <button onclick="shareReceiptWhatsApp('${order.id}')" style="flex: 1; background-color: #25d366; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">📱 Bagikan WhatsApp</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function generateCustomerReceipt(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.qty}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(item.price)}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-bottom: 1px solid #eee;">${formatPrice(item.subtotal)}</td>
        </tr>
    `).join('');

    return `
        <div style="max-width: 600px; padding: 30px; font-family: Arial; border: 2px solid #333;">
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
                    <p>Metode Pembayaran: <strong>${order.paymentMethod}</strong></p>
                    <p>Status: <strong style="color: ${order.status === 'delivered' ? '#28a745' : '#ff9800'};">${order.status.toUpperCase()}</strong></p>
                    <p>Jam: ${new Date(order.createdAt).toLocaleTimeString('id-ID')}</p>
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

function shareReceiptWhatsApp(orderId) {
    const orders = JSON.parse(localStorage.getItem('gunpla-orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const items = order.items.map(i => `${i.productName} (${i.qty}x)`).join('%0A');
    const message = `Bukti Pembelian:%0A%0AID: ${order.id}%0ATotal: ${formatPrice(order.total)}%0A%0AProduk:%0A${items}%0A%0AStatus: ${order.status.toUpperCase()}`;
    
    window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
}

// Notification Function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
