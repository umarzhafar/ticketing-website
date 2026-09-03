import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
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

// === LOGIKA REGISTER ===
const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const nama = document.getElementById('regNama')?.value;
        const hp = document.getElementById('regHp')?.value;
        const email = document.getElementById('regEmail')?.value;
        const password = document.getElementById('regPassword')?.value;

        if (!nama || !hp || !email || !password) {
            alert("Harap isi semua biodata!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Simpan ke Firestore
            await setDoc(doc(db, "users", user.uid), {
                namaLengkap: nama,
                noHp: hp,
                email: email,
                role: "customer",
                waktuDaftar: new Date()
            });

            alert("Pendaftaran berhasil!");
            window.location.href = "index.html";
        } catch (error) {
            alert("Gagal daftar: " + error.message);
        }
    });
}

// === LOGIKA LOGIN ===
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Berhasil masuk!");
                window.location.href = "index.html"; 
            })
            .catch((error) => {
                alert("Gagal masuk! Cek lagi email dan passwordnya."); 
            });
    });
}

// === LOGIKA LOGOUT ===
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Berhasil keluar!");
            window.location.href = "index.html"; 
        });
    });
}

// === CEK STATUS AUTH REALTIME ===
onAuthStateChanged(auth, async (user) => {
    const userMenu = document.getElementById('userMenu');
    const guestMenu = document.getElementById('guestMenu');
    const userEmailNav = document.getElementById('userEmailNav');

    if (user) {
        let namaTampil = user.email;

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                namaTampil = userSnap.data().namaLengkap;
            }
        } catch (error) {
            console.error("Gagal mengambil data Firestore:", error);
        }

        if (userEmailNav) userEmailNav.innerHTML = `Halo, <br><b>${namaTampil}</b>`;
        if (userMenu) userMenu.style.display = 'flex';
        if (guestMenu) guestMenu.style.display = 'none';
    } else {
        if (userMenu) userMenu.style.display = 'none';
        if (guestMenu) guestMenu.style.display = 'flex';
    }
});