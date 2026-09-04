// ==========================================================
// ATTENDANCE.JS - Logika Tabel Daftar Hadir Penonton
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
const db = getFirestore(app);

const attendanceTableBody = document.getElementById('attendanceTableBody');

let dataLaporanExcel = [];

async function muatDaftarHadir() {
    try {
        const q = query(collection(db, "reservations"), where("checkInStatus", "==", "checked_in"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #777;">Belum ada penonton yang check-in.</td></tr>`;
            dataLaporanExcel = [];
            return;
        }

        attendanceTableBody.innerHTML = '';
        dataLaporanExcel = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Masukkan ke array untuk format Excel nantinya
            dataLaporanExcel.push({
                "Nama Lengkap": data.namaLengkap,
                "Nama Event": data.eventName || "-",
                "Paket Tiket": data.packageName,
                "Kode Reservasi": data.reservationCode,
                "Status": "Sudah Check-In"
            });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${data.namaLengkap}</strong></td>
                <td>${data.packageName}</td>
                <td><code>${data.reservationCode}</code></td>
                <td><span style="color: #2e7d32; font-weight: bold; background: #e8f5e9; padding: 3px 8px; border-radius: 4px;">Sudah Masuk</span></td>
            `;
            attendanceTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Gagal memuat daftar hadir:", error);
        attendanceTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Gagal memuat data dari server.</td></tr>`;
    }
}

muatDaftarHadir();

document.getElementById('btnExport').addEventListener('click', () => {
    if (dataLaporanExcel.length === 0) {
        alert("Belum ada data penonton yang bisa di-export ke Excel!");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataLaporanExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kehadiran Penonton");

    XLSX.writeFile(workbook, "Laporan_Kehadiran_Penonton.xlsx");
});