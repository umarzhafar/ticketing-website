import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const sliderContainer = document.querySelector('.slider-container');
const dotsContainer = document.querySelector('.dots-container');

async function renderHomePageEvents() {
    if (!sliderContainer) return;

    try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Catat slide pertama (Zodiac Universe) yang udah ada di HTML biar nggak ketiban total
            const firstSlide = sliderContainer.firstElementChild;
            
            // Kalau mau nambahin di bawahnya tanpa ilangin Zodiac Universe, 
            // kita loop data dari database dan bikin elemen baru
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                
                const slideCard = document.createElement('div');
                slideCard.className = "banner-container slide";
                slideCard.style.background = "linear-gradient(to right, #380108, #cc151e)";
                
                slideCard.innerHTML = `
                    <div class="banner-subtitle">EVENT TERBARU</div>
                    <div class="banner-title">${data.eventName || '-'}</div>
                    <div class="banner-desc">${data.eventDesc || '-'}</div>
                    <div class="banner-date">${data.eventDate || '-'}</div>
                    <a href="detailevent1.html?id=${docSnap.id}">
                        <button class="banner-btn">Beli tiket di Sini</button>
                    </a>
                `;
                sliderContainer.appendChild(slideCard);

                // Tambah titik indikator (dot) otomatis untuk setiap event baru
                if (dotsContainer) {
                    const dot = document.createElement('div');
                    dot.className = "dot";
                    dotsContainer.appendChild(dot);
                }
            });
        }
    } catch (error) {
        console.error("Gagal memuat event beranda:", error);
    }
}

renderHomePageEvents();