import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const btnSimpanEvent = document.getElementById('btnSimpanEvent');

if (btnSimpanEvent) {
    btnSimpanEvent.addEventListener('click', async () => {
        const eventName = document.getElementById('inputEventName').value.trim();
        const eventDesc = document.getElementById('inputEventDesc').value.trim();
        const eventDate = document.getElementById('inputEventDate').value.trim();
        const eventFullDesc = document.getElementById('inputEventFullDesc').value.trim();
        
        const priceSingle = parseInt(document.getElementById('priceSingle').value) || 0;
        const priceTable = parseInt(document.getElementById('priceTable').value) || 0;
        const priceSofa = parseInt(document.getElementById('priceSofa').value) || 0;
        const eventTnC = document.getElementById('inputEventTnC').value.trim();

        if (!eventName || !eventDesc || !eventDate || !eventFullDesc) {
            alert("Harap isi semua kolom utama event dengan benar!");
            return;
        }

        try {
            // Simpan ke koleksi 'events' di Firestore dengan struktur lengkap
            await addDoc(collection(db, "events"), {
                eventName: eventName,
                eventDesc: eventDesc,          // Sub-judul / Lineup Artis
                eventDate: eventDate,          // Tanggal & Lokasi
                eventFullDesc: eventFullDesc,  // Deskripsi Lengkap Acara
                priceSingle: priceSingle,      // Harga Single Pass
                priceTable: priceTable,        // Harga Table Package
                priceSofa: priceSofa,          // Harga Sofa VIP Package
                eventTnC: eventTnC,            // Syarat & Ketentuan
                createdAt: serverTimestamp()
            });

            alert("Event baru berhasil ditambahkan dan langsung aktif di beranda!");
            window.location.href = "admin.html";
        } catch (error) {
            console.error("Gagal menyimpan event:", error);
            alert("Terjadi kesalahan: " + error.message);
        }
    });
}