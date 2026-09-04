// ==========================================================
// SCANNER.JS - Core API Kamera Stabil (Kunci Lensa Utama 1x)
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

function tampilkanHasil(status, pesan, detailHtml = "") {
    resultBox.style.display = "block";
    resultBox.className = "result-box";

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

async function onScanSuccess(decodedText) {
    if (!isScanning) return;
    
    try {
        let codeReservasi = decodedText.trim();

        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.reservationCode) {
                codeReservasi = parsed.reservationCode;
            }
        } catch (e) {}

        if (!codeReservasi) {
            tampilkanHasil("error", "QR Code Tidak Valid! ❌", "Format QR Code tidak dikenali.");
            return;
        }

        isScanning = false;

        const docRef = doc(db, "reservations", codeReservasi);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            tampilkanHasil("error", "TIKET TIDAK DITEMUKAN! ❌", `Kode: ${codeReservasi} tidak terdaftar di sistem.`);
        } else {
            const data = docSnap.data();

            if (data.checkInStatus === "checked_in") {
                tampilkanHasil("warning", "TIKET SUDAH PERNAH DIGUNAKAN! ⚠️", 
                    `<b>Nama:</b> ${data.namaLengkap}<br><b>Tiket:</b> ${data.packageName}<br><span style="color:red; font-weight:bold;">Tiket ini sudah di-scan sebelumnya!</span>`
                );
            } else {
                await updateDoc(docRef, {
                    checkInStatus: "checked_in"
                });

                tampilkanHasil("success", "TIKET VALID - SILAKAN MASUK! ✅", 
                    `<b>Nama Penonton:</b> ${data.namaLengkap}<br><b>Event:</b> ${data.eventName}<br><b>Paket:</b> ${data.packageName}<br><b>Kode:</b> ${data.reservationCode}`
                );
            }
        }

        setTimeout(() => {
            isScanning = true;
        }, 5000);

    } catch (error) {
        console.error("Detail Error Database:", error);
        tampilkanHasil("error", "Gagal Memproses Database ❌", `Pesan Error: ${error.message}`);
        isScanning = true;
    }
}

const html5QrCode = new Html5Qrcode("reader");

// 2. Fungsi Deteksi dan Filter Lensa Kamera
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        let selectedCameraId = devices[0].id; 

        // Prioritas 1: Cari kamera dengan label "back" dan angka "0" (Lensa Utama 1x)
        const mainBackCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') && device.label.includes('0')
        );
        
        // Prioritas 2: Jika "0" tidak ada, cari yang ada kata "back" saja
        const anyBackCamera = devices.find(device => 
            device.label.toLowerCase().includes('back')
        );

        if (mainBackCamera) {
            selectedCameraId = mainBackCamera.id;
        } else if (anyBackCamera) {
            selectedCameraId = anyBackCamera.id;
        } else {
            // Jika HP tidak ngasih nama label, biasanya kamera belakang ada di urutan terakhir
            selectedCameraId = devices[devices.length - 1].id;
        }

        // Mulai kamera dengan ID yang sudah diseleksi
        html5QrCode.start(
            selectedCameraId, // Pakai spesifik ID, bukan facingMode
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            onScanSuccess,
            (errorMessage) => { /* Abaikan error per frame */ }
        ).catch((err) => {
            console.error("Gagal memulai kamera dengan ID spesifik:", err);
            tampilkanHasil("error", "Kamera Gagal Diakses", "Pastikan izin kamera sudah diberikan.");
        });
    }
}).catch(err => {
    // Fallback: Jika browser nge-blokir pencarian list kamera, pakai cara lama
    console.warn("Gagal nge-list kamera, kembali ke default environment", err);
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        onScanSuccess,
        (errorMessage) => {}
    );
});