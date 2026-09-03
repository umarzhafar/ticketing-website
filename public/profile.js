import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const inputNama = document.getElementById('profileNama');
const inputHp = document.getElementById('profileHp');
const inputEmail = document.getElementById('profileEmail');
const btnSimpan = document.getElementById('btnSimpanProfile');

let userAktif = null;

// Load data profil dari Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userAktif = user;
        inputEmail.value = user.email;

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                inputNama.value = data.namaLengkap || '';
                inputHp.value = data.noHp || '';
            }
        } catch (error) {
            console.error("Gagal mengambil data profil:", error);
        }
    } else {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "login.html";
    }
});

// Update data profil ke Firestore
if (btnSimpan) {
    btnSimpan.addEventListener('click', async () => {
        if (!userAktif) return;

        const namaBaru = inputNama.value.trim();
        const hpBaru = inputHp.value.trim();

        if (!namaBaru || !hpBaru) {
            alert("Nama Lengkap dan Nomor HP wajib diisi!");
            return;
        }

        try {
            const userDocRef = doc(db, "users", userAktif.uid);
            await updateDoc(userDocRef, {
                namaLengkap: namaBaru,
                noHp: hpBaru
            });

            alert("Profil berhasil diperbarui!");
        } catch (error) {
            alert("Gagal memperbarui profil: " + error.message);
        }
    });
}