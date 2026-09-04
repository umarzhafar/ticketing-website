import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let dataKehadiranExcel = [];
let dataBookingExcel = [];

async function muatDataAdmin() {
    try {
        const snapshotAll = await getDocs(collection(db, "reservations"));
        
        dataKehadiranExcel = [];
        dataBookingExcel = [];

        snapshotAll.forEach((doc) => {
            const data = doc.data();
            const isCheckedIn = data.checkInStatus === "checked_in";
            
            // Menangkap berbagai kemungkinan nama field nomor telepon di database
            const teleponUser = data.noTelepon || data.phone || data.phoneNumber || data.whatsapp || data.telp || data.noHp || "-";

            // 1. Data Booking Khusus Keuangan (Tanpa status check-in, ditambah harga/nominal)
            dataBookingExcel.push({
                "Nama Lengkap": data.namaLengkap || "-",
                "No. Telepon": teleponUser,
                "Nama Event": data.eventName || "-",
                "Paket Tiket": data.packageName || "-",
                "Harga (Rp)": data.packagePrice || 0,
                "Kode Reservasi": data.reservationCode || "-"
            });

            // 2. Data khusus untuk Excel List Kehadiran
            if (isCheckedIn) {
                dataKehadiranExcel.push({
                    "Nama Lengkap": data.namaLengkap || "-",
                    "No. Telepon": teleponUser,
                    "Nama Event": data.eventName || "-",
                    "Paket Tiket": data.packageName || "-",
                    "Kode Reservasi": data.reservationCode || "-",
                    "Status": "Sudah Check-In"
                });
            }
        });
    } catch (error) {
        console.error("Gagal memuat data admin:", error);
    }
}

muatDataAdmin();

// Tombol 1: Download List Kehadiran (Hijau)
document.getElementById('btnExport').addEventListener('click', () => {
    if (dataKehadiranExcel.length === 0) {
        alert("Belum ada penonton yang melakukan check-in!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataKehadiranExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "List Kehadiran");
    XLSX.writeFile(workbook, "List_Kehadiran_Penonton.xlsx");
});

// Tombol 2: Download Data Booking Pelanggan untuk Keuangan (Biru)
document.getElementById('btnExportBooking').addEventListener('click', () => {
    if (dataBookingExcel.length === 0) {
        alert("Belum ada data booking yang tersimpan!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataBookingExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Keuangan Booking");
    XLSX.writeFile(workbook, "Data_Keuangan_Booking_Pelanggan.xlsx");
});