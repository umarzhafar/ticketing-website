import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// GUA TAMBAHIN deleteDoc, query, orderBy DI BARIS INI BIAR FITUR EVENT JALAN
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// =========================================================================
// KODE ASLI LU: FITUR AMBIL DATA RESERVASI & EXPORT EXCEL (TIDAK DIUBAH)
// =========================================================================

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

// =========================================================================
// KODE BARU: FITUR MENAMPILKAN DAN MENGHAPUS EVENT DARI DATABASE
// =========================================================================

const eventTableBody = document.getElementById('eventTableBody');

async function loadEventsAdmin() {
    if (!eventTableBody) return;
    
    eventTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data event...</td></tr>`;

    try {
        // Ambil data event dari yang paling baru dibuat
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            eventTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada event yang diterbitkan.</td></tr>`;
            return;
        }

        eventTableBody.innerHTML = ""; // Bersihin loading text

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const hargaFormatted = data.packagePrice ? `Rp ${data.packagePrice.toLocaleString('id-ID')}` : '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${data.eventName || '-'}</b></td>
                <td>${data.eventDesc || '-'}</td>
                <td>${data.eventDate || '-'}</td>
                <td>${hargaFormatted}</td>
                <td>
                    <button class="btn-delete" data-id="${id}" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Hapus</button>
                </td>
            `;
            eventTableBody.appendChild(tr);
        });

        // Event listener buat tombol hapus di setiap baris tabel
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventId = e.target.getAttribute('data-id');
                if (confirm("Yakin ingin menghapus event ini? Aksi ini tidak dapat dibatalkan.")) {
                    await deleteDoc(doc(db, "events", eventId));
                    alert("Event berhasil dihapus!");
                    loadEventsAdmin(); // Refresh tabel otomatis tanpa reload halaman
                }
            });
        });

    } catch (error) {
        console.error("Gagal mengambil data event:", error);
        eventTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data event. Cek console.</td></tr>`;
    }
}

// Fitur Hapus Event Pilihan (Multi-Select Checkbox)
// Taruh tombol ini di HTML admin lu: <button id="btnHapusPilihan" style="background:#dc3545; color:white; border:none; padding:8px 14px; border-radius:4px; cursor:pointer;">Hapus Event Terpilih</button>

document.getElementById('btnHapusPilihan')?.addEventListener('click', async () => {
    const selectedCheckboxes = document.querySelectorAll('.event-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert("Pilih minimal satu event yang mau dihapus terlebih dahulu!");
        return;
    }

    if (!confirm(`Yakin ingin menghapus ${selectedCheckboxes.length} event yang dipilih?`)) return;

    try {
        // Loop dan hapus satu-satu berdasarkan ID yang dicentang
        for (const cb of selectedCheckboxes) {
            await deleteDoc(doc(db, "events", cb.value));
        }

        alert("Event terpilih berhasil dihapus!");
        loadEventsAdmin();
    } catch (error) {
        console.error("Gagal menghapus event terpilih:", error);
        alert("Terjadi kesalahan saat menghapus event");
    }
});

// Panggil fungsi load event pas halaman admin dibuka
document.addEventListener('DOMContentLoaded', loadEventsAdmin);