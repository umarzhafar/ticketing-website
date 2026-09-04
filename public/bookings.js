// ==========================================================
// BOOKINGS.JS - Nampilin daftar tiket user & Pop-up QR (FIXED)
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const activeTicketsList = document.getElementById('activeTicketsList');
const historyTicketsList = document.getElementById('historyTicketsList');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Silakan login terlebih dahulu untuk melihat tiket kamu.");
        window.location.href = "login.html";
        return;
    }

    try {
        const q = query(collection(db, "reservations"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        // FIX 1: Ubah ticketsList jadi activeTicketsList untuk tampilan kosong
        if (querySnapshot.empty) {
            activeTicketsList.innerHTML = `
                <div class="empty-state">
                    <h2 style="margin-bottom: 15px;">Yah, tiket kamu kosong! 🎫</h2>
                    <p>Kamu belum membeli tiket apapun.</p>
                    <br>
                    <a href="index.html" style="background: #e52020; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;">Cari Event Sekarang</a>
                </div>
            `;
            historyTicketsList.innerHTML = `<div class="empty-state"><p>Belum ada riwayat tiket digunakan.</p></div>`;
            return;
        }

        activeTicketsList.innerHTML = '';
        historyTicketsList.innerHTML = '';
        let hasActive = false;
        let hasHistory = false;

        // FIX 2: Baris ticketsList.innerHTML = ''; dihapus karena udah di-handle di atas

        const qrModal = document.getElementById('qrModal');
        const closeModal = document.getElementById('closeModal');
        const modalQRCode = document.getElementById('modalQRCode');
        const modalResCode = document.getElementById('modalResCode');

        if (closeModal) {
            closeModal.onclick = () => { qrModal.style.display = "none"; }
        }
        window.onclick = (event) => { 
            if (event.target == qrModal) qrModal.style.display = "none"; 
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            const hargaFormat = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(data.packagePrice);

            const isCheckedIn = data.checkInStatus === "checked_in";
            
            const statusBadge = isCheckedIn 
            ? `<span style="color: #6c757d; font-weight: bold; background: #e9ecef; padding: 2px 8px; border-radius: 4px;">✓ Sudah Digunakan</span>`
            : `<span style="color: #28a745; font-weight: bold; background: #e8f5e9; padding: 2px 8px; border-radius: 4px;">✓ Lunas</span>`;
            
            const qrTextLabel = isCheckedIn ? "Tidak Aktif" : "Klik Perbesar";
            
            const ticketEl = document.createElement('div');
            ticketEl.className = isCheckedIn ? 'ticket-card checked-in' : 'ticket-card';
            ticketEl.innerHTML = `
                <div class="ticket-header">
                    <span>Kode Reservasi: <strong>${data.reservationCode}</strong></span>
                    ${statusBadge}
                </div>

                <div class="ticket-body">
                    <div class="ticket-info">
                        <h3>${data.eventName}</h3>
                        <p>📅 ${data.eventDate}</p>
                        <p>📍 ${data.eventLocation}</p>
                        <p>🎟️ <strong>${data.packageName}</strong> (${hargaFormat})</p>
                        <p>👤 Atas Nama: <strong>${data.namaLengkap}</strong></p>
                    </div>
                
                    <div class="qr-box qr-click-trigger" title="${isCheckedIn ? 'Tiket sudah digunakan' : 'Klik untuk memperbesar'}">
                        <div id="qr-${data.reservationCode}"></div>
                        <span>${qrTextLabel}</span>
                    </div>
                </div>
            `;
            
            // FIX 3: Hapus baris ticketsList.appendChild(ticketEl); karena error.
            // Langsung masukin ke kategori yang bener di bawah.

            const qrData = JSON.stringify({
                reservationCode: data.reservationCode,
                userId: data.userId,
                event: data.eventName,
                package: data.packageName
            });

            // PILIH MASUK KE WADAH MANA
            if (isCheckedIn) {
                hasHistory = true;
                historyTicketsList.appendChild(ticketEl);
            } else {
                hasActive = true;
                activeTicketsList.appendChild(ticketEl);

                const qrTrigger = ticketEl.querySelector('.qr-click-trigger');
                qrTrigger.addEventListener('click', () => {
                    modalQRCode.innerHTML = '';
                    
                    new QRCode(modalQRCode, {
                        text: qrData,
                        width: 220,
                        height: 220,
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    
                    modalResCode.innerText = data.reservationCode;
                    qrModal.style.display = 'flex';
                });
            }

            // Generate QR Code Kecil 
            new QRCode(document.getElementById(`qr-${data.reservationCode}`), {
                text: qrData,
                width: 100,
                height: 100,
                correctLevel: QRCode.CorrectLevel.H
            });
        });

        if (!hasActive) {
            activeTicketsList.innerHTML = `<div class="empty-state"><p>Tidak ada tiket aktif saat ini.</p></div>`;
        }
        if (!hasHistory) {
            historyTicketsList.innerHTML = `<div class="empty-state"><p>Belum ada riwayat tiket digunakan.</p></div>`;
        }

    } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
        activeTicketsList.innerHTML = `<div class="empty-state">Gagal memuat tiket. Pastikan koneksi internet lancar.</div>`;
    }
});