import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function loadEventDetail() {
    // Ambil ID dari URL (contoh: detailevent1.html?id=abc123xyz)
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        console.warn("Tidak ada ID event yang dipilih, menggunakan data statis.");
        return;
    }

    try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Masukkan data teks ke elemen HTML
            document.getElementById('titleEvent').innerText = data.eventName || '';
            document.getElementById('dateEvent').innerText = data.eventDate || '';
            document.getElementById('locationEvent').innerText = data.eventLocation || '';
            document.getElementById('artistsEvent').innerText = data.eventArtists || '';
            document.getElementById('descEvent').innerText = data.eventDesc || '';

            // Format harga ke Rupiah
            const formatRp = (angka) => angka ? `Rp ${angka.toLocaleString('id-ID')}` : 'Rp 0';

            document.getElementById('priceSingleDisplay').innerText = formatRp(data.priceSingle);
            document.getElementById('priceTableDisplay').innerText = formatRp(data.priceTable);
            document.getElementById('priceSofaDisplay').innerText = formatRp(data.priceSofa);

            // Masukkan Syarat & Ketentuan jika ada
            if (data.eventTnC) {
                const tncList = document.getElementById('tncEvent');
                tncList.innerHTML = "";
                data.eventTnC.split('\n').forEach(item => {
                    if(item.trim() !== "") {
                        const li = document.createElement('li');
                        li.innerText = item;
                        tncList.appendChild(li);
                    }
                });
            }
        } else {
            alert("Event tidak ditemukan!");
        }
    } catch (error) {
        console.error("Gagal meload detail event:", error);
    }
}

loadEventDetail();