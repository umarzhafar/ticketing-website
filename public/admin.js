import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function ambilDataReservasi() {
    try {
        const snapshotAll = await getDocs(collection(db, "reservations"));
        
        let listKehadiran = [];
        let listBooking = [];

        for (const reservationDoc of snapshotAll.docs) {
            const data = reservationDoc.data();
            const isCheckedIn = data.checkInStatus === "checked_in";
            
            let teleponUser = data.noHp || "-";

            if (teleponUser === "-" && data.userId) {
                try {
                    const userSnap = await getDoc(doc(db, "users", data.userId));
                    if (userSnap.exists()) {
                        teleponUser = userSnap.data().noHp || "-";
                    }
                } catch (err) {
                    console.warn("Gagal ambil data user untuk ID:", data.userId);
                }
            }

            let waktuBeli = "-";
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                waktuBeli = data.createdAt.toDate().toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });
            }

            // Fallback otomatis nama paket berdasarkan harga jika di database bernilai kosong/'-'
            let namaPaket = data.packageName;
            if (!namaPaket || namaPaket === "-") {
                if (data.packagePrice === 150000) namaPaket = "Single Pass (1 Pax)";
                else if (data.packagePrice === 1200000) namaPaket = "Table Package (4 Pax)";
                else if (data.packagePrice === 1800000) namaPaket = "Sofa VIP Package (6 Pax)";
                else namaPaket = "Tiket Kustom";
            }

            listBooking.push({
                "Nama Lengkap": data.namaLengkap || "-",
                "No. Telepon": teleponUser,
                "Nama Event": data.eventName || "-",
                "Paket Tiket": namaPaket,
                "Harga (Rp)": data.packagePrice || 0,
                "Kode Reservasi": data.reservationCode || "-",
                "Waktu Pembelian": waktuBeli
            });

            if (isCheckedIn) {
                listKehadiran.push({
                    "Nama Lengkap": data.namaLengkap || "-",
                    "No. Telepon": teleponUser,
                    "Nama Event": data.eventName || "-",
                    "Paket Tiket": namaPaket,
                    "Kode Reservasi": data.reservationCode || "-",
                    "Waktu Pembelian": waktuBeli,
                    "Status": "Sudah Check-In"
                });
            }
        }

        return { listKehadiran, listBooking };
    } catch (error) {
        console.error("Gagal memuat data admin:", error);
        return { listKehadiran: [], listBooking: [] };
    }
}

document.getElementById('btnExport').addEventListener('click', async () => {
    const { listKehadiran } = await ambilDataReservasi();
    if (listKehadiran.length === 0) {
        alert("Belum ada penonton yang melakukan check-in!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(listKehadiran);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "List Kehadiran");
    XLSX.writeFile(workbook, "List_Kehadiran_Penonton.xlsx");
});

document.getElementById('btnExportBooking').addEventListener('click', async () => {
    const { listBooking } = await ambilDataReservasi();
    if (listBooking.length === 0) {
        alert("Belum ada data booking yang tersimpan!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(listBooking);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Keuangan Booking");
    XLSX.writeFile(workbook, "Data_Keuangan_Booking_Pelanggan.xlsx");
});