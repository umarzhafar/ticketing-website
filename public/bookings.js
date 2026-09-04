// ==========================================================
// BOOKINGS.JS - Nampilin daftar tiket user & Pop-up QR
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase (samain kayak file lu yang lain)
const firebaseConfig = {
    apiKey: "AIzaSyBkjOVS8hnBMH_XG5jwyTiZfx-1YbMh9ec",
    authDomain: "tiketing-website.firebaseapp.com",
    projectId: "tiketing-website",
    storageBucket: "tiketing-website.firebasestorage.app",
    messagingSenderId: "975651875774",
    appId: "1:975651875774:web:04471e9715fd101ccee7ef",
    measurementId: "G-3DRP44JKW4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ticketsList = document.getElementById('ticketsList');

// ==========================================================
// CEK STATUS LOGIN & AMBIL TIKET
// ==========================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Kalau belum login, lempar ke halaman login
        alert("Silakan login terlebih dahulu untuk melihat tiket kamu.");
        window.location.href = "login.html";
        return;
    }

    try {
        // Bikin query: Ambil tiket dari koleksi "reservations"
        const q = query(collection(db, "reservations"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        // Kalau ternyata belum ada tiket sama sekali
        if (querySnapshot.empty) {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <h2 style="margin-bottom: 15px;">Yah, tiket kamu kosong! 🎫</h2>
                    <p>Kamu belum membeli tiket apapun.</p>
                    <br>
                    <a href="index.html" style="background: #e52020; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold;">Cari Event Sekarang</a>
                </div>
            `;
            return;
        }

        // Kalau ada tiketnya, kita bersihin tulisan "Memuat tiket..."
        ticketsList.innerHTML = '';

        // ==========================================
        // PERSIAPAN FITUR POP-UP QR CODE BESAR
        // ==========================================
        const qrModal = document.getElementById('qrModal');
        const closeModal = document.getElementById('closeModal');
        const modalQRCode = document.getElementById('modalQRCode');
        const modalResCode = document.getElementById('modalResCode');

        // Logika buat nutup Pop-up kalau tombol silang (x) diklik
        if (closeModal) {
            closeModal.onclick = () => { qrModal.style.display = "none"; }
        }
        // Logika buat nutup Pop-up kalau area gelap di luar kotak diklik
        window.onclick = (event) => { 
            if (event.target == qrModal) qrModal.style.display = "none"; 
        }

        // Looping (ulangi) setiap tiket yang didapat dari database
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Format angka Rupiah
            const hargaFormat = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(data.packagePrice);

            // Bikin elemen HTML untuk setiap tiket
            const ticketEl = document.createElement('div');
            ticketEl.className = 'ticket-card';
            ticketEl.innerHTML = `
                <div class="ticket-header">
                    <span>Kode Reservasi: <strong>${data.reservationCode}</strong></span>
                    <span style="color: #28a745; font-weight: bold; background: #e8f5e9; padding: 2px 8px; border-radius: 4px;">✓ Lunas</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-info">
                        <h3>${data.eventName}</h3>
                        <p>📅 ${data.eventDate}</p>
                        <p>📍 ${data.eventLocation}</p>
                        <p>🎟️ <strong>${data.packageName}</strong> (${hargaFormat})</p>
                        <p>👤 Atas Nama: <strong>${data.namaLengkap}</strong></p>
                    </div>
                    
                    <!-- DITAMBAHIN CLASS 'qr-click-trigger' BIAR BISA DI-KLIK -->
                    <div class="qr-box qr-click-trigger" title="Klik untuk memperbesar">
                        <div id="qr-${data.reservationCode}"></div>
                        <span>Klik Perbesar</span>
                    </div>
                </div>
            `;
            
            // Masukin elemen tiket ke halaman
            ticketsList.appendChild(ticketEl);

            // Data yang dimasukkan ke dalam QR Code
            const qrData = JSON.stringify({
                reservationCode: data.reservationCode,
                userId: data.userId,
                event: data.eventName,
                package: data.packageName
            });

            // 1. Generate QR Code Kecil di dalam kotak tiket
            new QRCode(document.getElementById(`qr-${data.reservationCode}`), {
                text: qrData,
                width: 100,
                height: 100,
                correctLevel: QRCode.CorrectLevel.H
            });

            // 2. Logika ketika Kotak QR Kecil diklik -> Munculin Pop-up Besar
            const qrTrigger = ticketEl.querySelector('.qr-click-trigger');
            qrTrigger.addEventListener('click', () => {
                // Bersihin isi QR Code di modal sebelumnya
                modalQRCode.innerHTML = '';
                
                // Bikin QR Code versi besar
                new QRCode(modalQRCode, {
                    text: qrData,
                    width: 220,
                    height: 220,
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                // Tampilkan kode reservasi di pop-up
                modalResCode.innerText = data.reservationCode;
                
                // Munculin layarnya
                qrModal.style.display = 'flex';
            });
        });

    } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
        ticketsList.innerHTML = `<div class="empty-state">Gagal memuat tiket. Pastikan koneksi internet lancar.</div>`;
    }
});