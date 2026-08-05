function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    alert("Berhasil login dengan Google! Token didapat.");
}

function handleGoogleLogin() {
    google.accounts.id.initialize({
        client_id: "CLIENT_ID_GOOGLE_LU_DISINI.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    google.accounts.id.prompt(); 
}
// ==========================================
// FITUR PENCARIAN EVENT
// ==========================================

const kolomPencarian = document.getElementById('kolomPencarian');
const tombolCari = document.getElementById('tombolCari');

function jalankanPencarian() {
    // Ambil teks yang diketik user
    const kataKunci = kolomPencarian.value.toLowerCase();
    
    // Ambil semua event yang ada di dalam slider
    const daftarEvent = document.querySelectorAll('.banner-container.slide');

    daftarEvent.forEach(function(event) {
        // Ambil judul event dari class banner-title
        const judul = event.querySelector('.banner-title').innerText.toLowerCase();

        // Cek apakah judul cocok dengan kata kunci
        if (judul.includes(kataKunci)) {
            event.style.display = 'flex'; // Munculkan (pakai flex menyesuaikan CSS lu)
        } else {
            event.style.display = 'none'; // Sembunyikan
        }
    });
}

// Jalankan saat tombol kaca pembesar diklik
tombolCari.addEventListener('click', jalankanPencarian);

// Jalankan saat user tekan tombol 'Enter' di keyboard
kolomPencarian.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        jalankanPencarian();
    }
});

// ==========================================
// FITUR PILIH PAKET TIKET & UPDATE HARGA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Tangkap semua elemen kotak tiket dan tombol beli
    const opsiTiket = document.querySelectorAll('.ticket-option');
    const btnBeli = document.getElementById('btnBeliTiket');

    // Pastikan elemennya ada di halaman ini biar nggak error
    if (opsiTiket.length > 0 && btnBeli) {
        
        opsiTiket.forEach(option => {
            option.addEventListener('click', () => {
                // 1. Hapus warna merah (class 'active') dari semua opsi
                opsiTiket.forEach(opt => opt.classList.remove('active'));
                
                // 2. Kasih warna merah (class 'active') ke kotak yang baru aja diklik
                option.classList.add('active');
                
                // 3. Ambil angka harga dari HTML (atribut data-harga)
                const harga = parseInt(option.getAttribute('data-harga'));
                
                // 4. Format angkanya jadi gaya Rupiah (contoh: 1200000 jadi 1.200.000)
                const hargaFormat = harga.toLocaleString('id-ID');
                
                // 5. Ubah teks di tombol merah paling bawah
                btnBeli.innerText = `Pesan Tiket Sekarang (Rp ${hargaFormat})`;
            });
        });
    }
});