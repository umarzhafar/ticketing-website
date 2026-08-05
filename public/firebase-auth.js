// 1. Import modul Firebase (ditambah createUserWithEmailAndPassword untuk fitur daftar)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. Kunci Konfigurasi Brankas Lu
const firebaseConfig = {
  apiKey: "AIzaSyBkjOVS8hnBMH_XG5jwyTiZfx-1YbMh9ec",
  authDomain: "tiketing-website.firebaseapp.com",
  projectId: "tiketing-website",
  storageBucket: "tiketing-website.firebasestorage.app",
  messagingSenderId: "975651875774",
  appId: "1:975651875774:web:04471e9715fd101ccee7ef",
  measurementId: "G-3DRP44JKW4"
};

// 3. Menghidupkan Firebase & Otak Autentikasi
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// === LOGIKA MENDAFTAR (Khusus halaman register.html) ===
const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Perintah Firebase untuk membuat akun baru
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Pendaftaran berhasil! Akun lu tersimpan di Firebase.");
                window.location.href = "index.html"; // Balik otomatis ke beranda
            })
            .catch((error) => {
                alert("Gagal daftar: " + error.message);
            });
    });
}

// === LOGIKA LOGIN (Khusus halaman login.html) ===
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Berhasil masuk!");
                window.location.href = "index.html"; 
            })
            .catch((error) => {
                alert("Gagal masuk! Cek lagi email dan passwordnya."); 
            });
    });
}

// === LOGIKA LOGOUT (Khusus halaman dashboard.html) ===
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Berhasil keluar dari akun!");
            window.location.href = "index.html"; 
        });
    });
}

// Cek status login user secara realtime
onAuthStateChanged(auth, async (user) => {
    const userMenu = document.getElementById('userMenu'); // Elemen wadah teks 'Halo...'
    const guestMenu = document.getElementById('guestMenu');

    if (user) {
        // 1. Ambil data dokumen user dari Firestore berdasarkan UID
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            let namaTampil = user.email; // Fallback jika data Firestore belum ada

            if (userSnap.exists()) {
                const userData = userSnap.data();
                namaTampil = userData.namaLengkap; // Ambil Nama Lengkap
            }

            // 2. Tampilkan Nama Lengkap di UI
            if (userMenu) {
                userMenu.innerHTML = `
                    <span>Halo, <br><b>${namaTampil}</b></span>
                    <button id="btnLogout" class="btn-outline">Keluar</button>
                `;
                userMenu.style.display = 'flex';
            }
            if (guestMenu) guestMenu.style.display = 'none';

        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        }

    } else {
        // Tampilan jika user belum login
        if (userMenu) userMenu.style.display = 'none';
        if (guestMenu) guestMenu.style.display = 'flex';
    }
});

// 1. Import Auth dan Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";

// Konfigurasi Firebase lu (copy dari Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "tiketing-website.firebaseapp.com",
    projectId: "tiketing-website",
    // ... (isi sesuai config lu)
};

// Inisialisasi Firebase & Layanan
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // <- Inisialisasi Database

// 2. Tangkap elemen dari register.html
const btnDaftar = document.getElementById('registerBtn');

if (btnDaftar) {
    btnDaftar.addEventListener('click', () => {
        // Ambil data yang diketik user
        const nama = document.getElementById('regNama').value;
        const hp = document.getElementById('regHp').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Validasi simpel
        if (!nama || !hp || !email || !password) {
            alert("Harap isi semua biodata!");
            return;
        }

        // 3. Daftarkan user ke Firebase Auth
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user; // Ini info user yang baru jadi
                
                // 4. Simpan biodata ke Firestore Database di "folder" users
                // Kita pakai user.uid sebagai nama filenya biar datanya nggak tertukar
                return setDoc(doc(db, "users", user.uid), {
                    namaLengkap: nama,
                    noHp: hp,
                    email: email,
                    role: "customer", // Lu bisa nambahin penanda bahwa ini akun pembeli
                    waktuDaftar: new Date()
                });
            })
            .then(() => {
                alert("Pendaftaran dan pengisian biodata berhasil!");
                // Arahkan user ke halaman utama atau halaman login
                window.location.href = "index.html"; 
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Gagal mendaftar: ${errorMessage}`);
                console.error(errorCode, errorMessage);
            });
    });
}