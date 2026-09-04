// ==========================================================
// SCANNER.JS - Validasi QR Code Tiket di Pintu Masuk
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const resultBox = document.getElementById('scanResult');
const resultMessage = document.getElementById('resultMessage');
const resultDetail = document.getElementById('resultDetail');

let isScanning = true;

// Fungsi untuk menampilkan hasil scan ke layar dengan jelas
function tampilkanHasil(status, pesan, detailHtml = "") {
    resultBox.style.display = "block";
    resultBox.className = "result-box"; // Reset class

    if (status === "success") {
        resultBox.classList.add("result-success");
    } else if (status === "warning") {
        resultBox.classList.add("result-warning");
    } else {
        resultBox.classList.add("result-error");
    }

    resultMessage.innerText = pesan;
    resultDetail.innerHTML = detailHtml;
}

// Fungsi utama saat QR Code tertangkap kamera
async function onScanSuccess(decodedText) {
    if (!isScanning) return;
    
    try {
        let codeReservasi = decodedText.trim();

        // Cek apakah QR code berisi format JSON atau teks biasa
        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.reservationCode) {
                codeReservasi = parsed.reservationCode;
            }
        } catch (e) {
            // Jika bukan JSON, berarti langsung string kode reservasi (misal: W5987SZUDG)
        }

        if (!codeReservasi) {
            tampilkanHasil("error", "QR Code Tidak Valid! ❌", "Format QR Code tidak dikenali sistem.");
            return;
        }

        // Hentikan proses scan sementara agar tidak membaca berulang kali
        isScanning = false;

        // Ambil data dari koleksi "reservations" berdasarkan kode reservasi
        const docRef = doc(db, "reservations", codeReservasi);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            tampilkanHasil("error", "TIKET TIDAK DITEMUKAN! ❌", `Kode: ${codeReservasi} tidak terdaftar di database.`);
        } else {
            const data = docSnap.data();

            // CEK 1: Apakah tiket sudah pernah di-scan sebelumnya?
            if (data.checkInStatus === "checked_in") {
                tampilkanHasil("warning", "TIKET SUDAH PERNAH DIGUNAKAN! ⚠️", 
                    `<b>Nama:</b> ${data.namaLengkap}<br><b>Tiket:</b> ${data.packageName} (${data.eventName})<br><span style="color:red; font-weight:bold;">Tiket ini sudah di-check-in sebelumnya!</span>`
                );
            } else {
                // CEK 2: Jika belum, ubah status di Firestore menjadi "checked_in" agar terkunci
                await updateDoc(docRef, {
                    checkInStatus: "checked_in"
                });

                tampilkanHasil("success", "TIKET VALID - SILAKAN MASUK! ✅", 
                    `<b>Nama Penonton:</b> ${data.namaLengkap}<br><b>Event:</b> ${data.eventName}<br><b>Paket:</b> ${data.packageName}<br><b>Kode:</b> ${data.reservationCode}`
                );
            }
        }

        // Beri jeda 5 detik sebelum scanner bisa membaca tiket berikutnya
        setTimeout(() => {
            isScanning = true;
        }, 5000);

    } catch (error) {
        console.error("Gagal memproses QR:", error);
        tampilkanHasil("error", "Gagal Memproses QR Code", "Terjadi kesalahan pada sistem database.");
        isScanning = true;
    }
}

// Inisialisasi Html5QrcodeScanner
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: { width: 250, height: 250 } },
    false
);

html5QrcodeScanner.render(onScanSuccess, (errorMessage) => {
    // Abaikan error frame kecil saat kamera mencari posisi QR
});