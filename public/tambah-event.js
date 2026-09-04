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
        const eventPrice = parseInt(document.getElementById('inputEventPrice').value);

        if (!eventName || !eventDesc || !eventDate || !eventPrice) {
            alert("Harap isi semua kolom dengan benar!");
            return;
        }

        try {
            // Simpan ke koleksi 'events' di Firestore
            await addDoc(collection(db, "events"), {
                eventName: eventName,
                eventDesc: eventDesc,
                eventDate: eventDate,
                packagePrice: eventPrice,
                packageName: "Single Pass (1 Pax)",
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