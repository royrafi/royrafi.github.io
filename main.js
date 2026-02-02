const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ6BrmJSTSQMYX9iCM040GTYrOfn_j1g9apzr0Bj4wfxrvWPKr6ojsGZstzrhqFUzNr_LPS1BmNvPB/pub?output=csv';
const WA_BUSINESS_NUMBER = '628888118194';

let allProducts = [];
let cart = [];

const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
};

async function initToko() {
    try {
        Papa.parse(SHEET_CSV_URL, {
            download: true,
            header: true,
            complete: function(results) {
                allProducts = results.data.filter(p => p.nama); // Filter out empty rows
                renderProduk(allProducts);
            },
            error: function(error) {
                console.error("Gagal memuat atau mengurai data produk:", error);
                const container = document.getElementById('product-container');
                container.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat produk. Silakan periksa kembali URL dan format Google Sheet Anda.</p>`;
            }
        });
    } catch (error) {
        console.error("Gagal memuat data produk:", error);
        const container = document.getElementById('product-container');
        container.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat produk. Silakan coba lagi nanti.</p>`;
    }
}

function renderProduk(data) {
    const container = document.getElementById('product-container');
    container.innerHTML = "";

    data.forEach((item, index) => {
        const isAvailable = item.stok?.toLowerCase() === 'tersedia';
        const stokColor = isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const images = (item.foto || '').split(',').map(url => url.trim()).filter(url => url);
        const carouselId = `carousel-${index}`;

        const carouselImages = images.length > 0 
            ? images.map(img => `<img src="${img}" alt="${item.nama}" class="carousel-image w-full h-56 object-cover bg-gray-200" onerror="this.onerror=null;this.src='https://via.placeholder.com/300';">`).join('')
            : '<img src="https://via.placeholder.com/300" alt="Placeholder Image" class="w-full h-56 object-cover bg-gray-200">';
        
        const carouselIndicators = images.map((_, i) => `<div class="indicator-dot ${i === 0 ? 'active' : ''}" data-slide-to="${i}"></div>`).join('');

        const html = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:scale-105 duration-300 border border-gray-100 flex flex-col">
                <div id="${carouselId}" class="relative product-image-carousel">
                     <div class="carousel-images flex">${carouselImages}</div>
                     ${images.length > 1 ? `
                        <button class="carousel-button prev">&lt;</button>
                        <button class="carousel-button next">&gt;</button>
                        <div class="carousel-indicators">${carouselIndicators}</div>
                    ` : ''}
                    <span class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase shadow-sm ${stokColor}">${item.stok}</span>
                    <span class="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs capitalize">${item.kategori}</span>
                </div>
                <div class="p-5 flex-grow flex flex-col">
                    <h4 class="text-xl font-bold text-gray-800">${item.nama}</h4>
                    <p class="text-gray-500 text-sm my-2 flex-grow">${item.deskripsi}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-blue-600 font-extrabold text-lg">${formatRupiah(item.harga)}</span>
                        <button data-product-id="${item.nama}" class="add-to-cart-btn ${!isAvailable ? 'pointer-events-none bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded-lg font-medium transition whitespace-nowrap w-auto">
                           ${isAvailable ? 'Tambah Keranjang' : 'Habis'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
    setupCarousels();
    setupAddToCartButtons();
}

function setupCarousels() {
    document.querySelectorAll('.product-image-carousel').forEach(carousel => {
        const imageContainer = carousel.querySelector('.carousel-images');
        if (!imageContainer || imageContainer.children.length <= 1) return;
        const images = Array.from(imageContainer.children);
        const prevButton = carousel.querySelector('.prev');
        const nextButton = carousel.querySelector('.next');
        const dots = carousel.querySelectorAll('.indicator-dot');
        let currentIndex = 0;

        function updateCarousel() {
            images.forEach((img, i) => img.style.transform = `translateX(${(i - currentIndex) * 100}%)`);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
                updateCarousel();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
                updateCarousel();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.slideTo);
                updateCarousel();
            });
        });
        updateCarousel(); // Initial setup
    });
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const product = allProducts.find(p => p.nama === productId);
            addToCart(product);
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.nama === product.nama);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartInfo = document.getElementById('cart-info');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    cartInfo.textContent = `(${totalItems}) Barang - ${formatRupiah(totalPrice)}`;

    const proceedButton = document.getElementById('proceed-to-shipping-button');
    proceedButton.disabled = totalItems === 0;
}

function renderCartModal() {
    const container = document.getElementById('cart-items-container');
    const modalTotal = document.getElementById('cart-modal-total');
    
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Keranjang Anda kosong.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemHtml = `
                <div class="flex justify-between items-center py-2 border-b">
                    <div>
                        <p class="font-bold">${item.nama}</p>
                        <p class="text-sm text-gray-600">${formatRupiah(item.harga)} x ${item.quantity}</p>
                    </div>
                    <div class="flex items-center">
                         <p class="font-bold mr-4">${formatRupiah(item.harga * item.quantity)}</p>
                         <button data-cart-item-id="${index}" class="remove-from-cart-btn text-red-500 hover:text-red-700">&times;</button>
                    </div>
                </div>
            `;
            container.innerHTML += itemHtml;
        });
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    modalTotal.textContent = formatRupiah(totalPrice);
    setupRemoveFromCartButtons();
}

function setupRemoveFromCartButtons() {
     document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const cartItemId = parseInt(e.target.dataset.cartItemId);
            removeFromCart(cartItemId);
        });
    });
}

function removeFromCart(cartItemId) {
    cart.splice(cartItemId, 1);
    updateCartUI();
    renderCartModal();
}

function generateWhatsAppMessage(shippingDetails) {
    if (cart.length === 0) return '';
    
    let message = 'Halo, saya ingin memesan barang berikut:\n\n';
    message += `*DETAIL PEMESANAN*\n`;
    message += `-------------------\n`;
    cart.forEach(item => {
        message += `*${item.nama}*\n`;
        message += `Jumlah: ${item.quantity}\n`;
        message += `Subtotal: ${formatRupiah(item.harga * item.quantity)}\n\n`;
    });
    const totalPrice = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    message += `*Total Belanja: ${formatRupiah(totalPrice)}*\n\n`;

    message += `*DETAIL PENGIRIMAN*\n`;
    message += `--------------------\n`;
    message += `Nama: ${shippingDetails.nama}\n`;
    message += `Telepon: ${shippingDetails.telepon}\n`;
    message += `Alamat: ${shippingDetails.alamat}\n`;
    message += `Metode Pembayaran: ${shippingDetails.metode_pembayaran}\n\n`;
    message += `Terima kasih!`;

    return encodeURIComponent(message);
}

document.addEventListener('DOMContentLoaded', () => {
    initToko();

    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.getElementById('close-cart-modal');
    const shippingModal = document.getElementById('shipping-modal');
    const closeShippingModal = document.getElementById('close-shipping-modal');
    const shippingForm = document.getElementById('shipping-form');
    const proceedToShippingButton = document.getElementById('proceed-to-shipping-button');
    const backToCartButton = document.getElementById('back-to-cart-button');

    cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        renderCartModal();
        cartModal.classList.remove('hidden');
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.classList.add('hidden');
    });

    proceedToShippingButton.addEventListener('click', () => {
        cartModal.classList.add('hidden');
        shippingModal.classList.remove('hidden');
    });

    closeShippingModal.addEventListener('click', () => {
        shippingModal.classList.add('hidden');
    });

    backToCartButton.addEventListener('click', () => {
        shippingModal.classList.add('hidden');
        cartModal.classList.remove('hidden');
    });
    
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const shippingDetails = Object.fromEntries(formData.entries());
        
        const message = generateWhatsAppMessage(shippingDetails);
        if (message) {
            window.open(`https://wa.me/${WA_BUSINESS_NUMBER}?text=${message}`, '_blank');
        }
    });
});
