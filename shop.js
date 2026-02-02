const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ6BrmJSTSQMYX9iCM040GTYrOfn_j1g9apzr0Bj4wfxrvWPKr6ojsGZstzrhqFUzNr_LPS1BmNvPB/pub?output=csv';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
};

function parseCSV(csvText) {
    const lines = csvText.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(",");
        headers.forEach((header, s) => {
            obj[header.trim()] = currentline[s]?.trim();
        });
        result.push(obj);
    }
    return result;
}

// Fungsi utama untuk merender kartu produk
function renderProduk(data) {
    const container = document.getElementById('product-container');
    container.innerHTML = "";

    data.forEach(item => {
        // Logika warna label stok
        const stokColor = item.stok?.toLowerCase() === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        
        const html = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:scale-105 duration-300 border border-gray-100">
                <div class="relative">
                    <img src="${item.foto}" alt="${item.nama}" class="w-full h-56 object-cover bg-gray-200">
                    <span class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase shadow-sm ${stokColor}">
                        ${item.stok}
                    </span>
                    <span class="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        ${item.kategori}
                    </span>
                </div>
                <div class="p-5">
                    <h4 class="text-xl font-bold text-gray-800">${item.nama}</h4>
                    <p class="text-gray-500 text-sm my-2 line-clamp-2">${item.deskripsi}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-blue-600 font-extrabold text-lg">${formatRupiah(item.harga)}</span>
                        <a href="https://wa.me/${item.waLink}?text=Halo Roy, apakah ${item.nama} masih ada?" 
                           target="_blank" 
                           class="${item.stok?.toLowerCase() === 'habis' ? 'pointer-events-none bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg font-medium transition">
                           ${item.stok?.toLowerCase() === 'habis' ? 'Sold Out' : 'Chat WA'}
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

async function initToko() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const dataText = await response.text();
        const allProducts = parseCSV(dataText);

        // Tampilkan semua produk saat pertama kali buka
        renderProduk(allProducts);

        // Tambahkan event listener untuk filter (Jika kamu punya tombol filter)
        // Contoh: document.getElementById('btn-elektronik').addEventListener('click', () => {
        //    const filtered = allProducts.filter(p => p.kategori === 'Elektronik');
        //    renderProduk(filtered);
        // });

    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
}

document.addEventListener('DOMContentLoaded', initToko);
