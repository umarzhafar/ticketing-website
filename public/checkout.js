// ==========================================================
// CHECKOUT.JS
// Sistem Checkout Ticketing Website
// ==========================================================


// ==========================================================
// 1. IMPORT FIREBASE
// ==========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ==========================================================
// 2. FIREBASE CONFIG
// ==========================================================

const firebaseConfig = {
    apiKey: "AIzaSyBkjOVS8hnBMH_XG5jwyTiZfx-1YbMh9ec",
    authDomain: "tiketing-website.firebaseapp.com",
    projectId: "tiketing-website",
    storageBucket: "tiketing-website.firebasestorage.app",
    messagingSenderId: "975651875774",
    appId: "1:975651875774:web:04471e9715fd101ccee7ef",
    measurementId: "G-3DRP44JKW4"
};


// ==========================================================
// 3. INISIALISASI FIREBASE
// ==========================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================================
// 4. AMBIL DATA PAKET DARI localStorage
// ==========================================================

const savedPackage =
    localStorage.getItem("selectedPackage");


// Kalau tidak ada data paket
if (!savedPackage) {

    alert(
        "Paket belum dipilih. Silakan pilih tiket terlebih dahulu."
    );

    window.location.href =
        "index.html";

}


// ==========================================================
// 5. PARSING DATA PAKET
// ==========================================================

let packageData;

try {

    packageData =
        JSON.parse(savedPackage);

} catch (error) {

    console.error(
        "Data paket tidak valid:",
        error
    );

    alert(
        "Data paket tidak valid. Silakan pilih tiket kembali."
    );

    window.location.href =
        "index.html";

}


// ==========================================================
// 6. AMBIL ELEMENT HTML
// ==========================================================

// Ringkasan pesanan
const packageNameElement =
    document.getElementById("packageName");

const packagePriceElement =
    document.getElementById("packagePrice");


// Pembayaran
const paymentOptions =
    document.querySelectorAll(".payment-option");

const selectedPaymentElement =
    document.getElementById("selectedPayment");

const payButton =
    document.getElementById("payButton");


// Reservasi
const reservationSection =
    document.getElementById("reservationSection");

const reservationCodeElement =
    document.getElementById("reservationCode");

const reservationNameElement =
    document.getElementById("reservationName");

const reservationPackageElement =
    document.getElementById("reservationPackage");

const reservationPaymentElement =
    document.getElementById("reservationPayment");

const qrCodeElement =
    document.getElementById("qrcode");


// Tombol home
const homeButton =
    document.getElementById("homeButton");


// ==========================================================
// 7. VARIABEL USER
// ==========================================================

let currentUser = null;

let currentUserData = null;


// ==========================================================
// 8. VARIABEL METODE PEMBAYARAN
// ==========================================================

let selectedPaymentMethod = null;


// ==========================================================
// 9. FORMAT RUPIAH
// ==========================================================

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(angka);

}


// ==========================================================
// 10. TAMPILKAN RINGKASAN PESANAN
// ==========================================================

if (packageNameElement) {

    packageNameElement.textContent =
        packageData.packageName;

}


if (packagePriceElement) {

    packagePriceElement.textContent =
        formatRupiah(
            packageData.packagePrice
        );

}


// ==========================================================
// 11. CEK USER LOGIN
// ==========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        // --------------------------------------------------
        // USER BELUM LOGIN
        // --------------------------------------------------

        if (!user) {

            alert(
                "Silakan login terlebih dahulu."
            );

            window.location.href =
                "login.html";

            return;

        }


        // --------------------------------------------------
        // SIMPAN USER YANG LOGIN
        // --------------------------------------------------

        currentUser =
            user;


        console.log(
            "User login:",
            currentUser.email
        );


        // --------------------------------------------------
        // AMBIL DATA USER DARI FIRESTORE
        // --------------------------------------------------

        try {

            const userDocRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(
                    userDocRef
                );


            if (userSnap.exists()) {

                currentUserData =
                    userSnap.data();

                console.log(
                    "Data user:",
                    currentUserData
                );

            } else {

                console.warn(
                    "Dokumen user tidak ditemukan."
                );


                // Fallback menggunakan email Firebase
                currentUserData = {

                    namaLengkap:
                        user.email,

                    email:
                        user.email

                };

            }


        } catch (error) {

            console.error(
                "Gagal mengambil data user:",
                error
            );


            // Fallback
            currentUserData = {

                namaLengkap:
                    user.email,

                email:
                    user.email

            };

        }

    }
);


// ==========================================================
// 12. PILIH METODE PEMBAYARAN
// ==========================================================

paymentOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            function () {

                // ------------------------------------------
                // Hapus selected dari semua tombol
                // ------------------------------------------

                paymentOptions.forEach(
                    (opt) => {

                        opt.classList.remove(
                            "selected"
                        );

                    }
                );


                // ------------------------------------------
                // Tandai tombol yang dipilih
                // ------------------------------------------

                this.classList.add(
                    "selected"
                );


                // ------------------------------------------
                // Ambil metode pembayaran
                // ------------------------------------------

                selectedPaymentMethod =
                    this.getAttribute(
                        "data-method"
                    );


                // ------------------------------------------
                // Tampilkan pilihan
                // ------------------------------------------

                if (
                    selectedPaymentElement
                ) {

                    selectedPaymentElement.textContent =
                        `Metode pembayaran dipilih: ${selectedPaymentMethod}`;

                }


                console.log(
                    "Metode pembayaran:",
                    selectedPaymentMethod
                );

            }
        );

    }
);


// ==========================================================
// 13. GENERATE KODE RESERVASI
// ==========================================================

function generateReservationCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );


        result +=
            characters[randomIndex];

    }


    return result;

}


// ==========================================================
// 14. PROSES PEMBAYARAN
// ==========================================================

if (payButton) {

    payButton.addEventListener(
        "click",
        async function () {

            // ------------------------------------------
            // CEK USER
            // ------------------------------------------

            if (!currentUser) {

                alert(
                    "Data login belum terbaca. Silakan tunggu sebentar atau login kembali."
                );

                return;

            }


            // ------------------------------------------
            // CEK METODE PEMBAYARAN
            // ------------------------------------------

            if (!selectedPaymentMethod) {

                alert(
                    "Silakan pilih metode pembayaran terlebih dahulu."
                );

                return;

            }


            // ------------------------------------------
            // DISABLE BUTTON
            // ------------------------------------------

            payButton.disabled =
                true;

            payButton.textContent =
                "Memproses pembayaran...";


            // ------------------------------------------
            // SIMULASI PROSES PEMBAYARAN
            // ------------------------------------------

            await new Promise(
                (resolve) => {

                    setTimeout(
                        resolve,
                        1500
                    );

                }
            );


            // ------------------------------------------
            // GENERATE KODE RESERVASI
            // ------------------------------------------

            const reservationCode =
                generateReservationCode();


            // ------------------------------------------
            // AMBIL NAMA USER
            // ------------------------------------------

            let namaUser =
                currentUser.email;


            if (
                currentUserData &&
                currentUserData.namaLengkap
            ) {

                namaUser =
                    currentUserData.namaLengkap;

            }


            // ------------------------------------------
            // DATA RESERVASI
            // ------------------------------------------

            const reservationData = {

                reservationCode:
                    reservationCode,

                userId:
                    currentUser.uid,

                namaLengkap:
                    namaUser,

                email:
                    currentUser.email,

                eventName:
                    packageData.eventName,

                eventDate:
                    packageData.eventDate,

                eventLocation:
                    packageData.eventLocation,

                packageName:
                    packageData.packageName,

                packagePrice:
                    packageData.packagePrice,

                paymentMethod:
                    selectedPaymentMethod,

                paymentStatus:
                    "paid",

                checkInStatus:
                    "not_checked_in"

            };


            // ------------------------------------------
            // SIMPAN SEMENTARA KE localStorage
            // ------------------------------------------

            localStorage.setItem(
                "reservationData",
                JSON.stringify(
                    reservationData
                )
            );


            // ==================================================
            // 15. SIMPAN KE FIRESTORE
            // ==================================================

            try {

                await setDoc(
                    doc(
                        db,
                        "reservations",
                        reservationCode
                    ),
                    {

                        reservationCode:
                            reservationCode,

                        userId:
                            currentUser.uid,

                        namaLengkap:
                            namaUser,

                        email:
                            currentUser.email,

                        eventName:
                            packageData.eventName,

                        eventDate:
                            packageData.eventDate,

                        eventLocation:
                            packageData.eventLocation,

                        packageName:
                            packageData.packageName,

                        packagePrice:
                            packageData.packagePrice,

                        paymentMethod:
                            selectedPaymentMethod,

                        paymentStatus:
                            "paid",

                        checkInStatus:
                            "not_checked_in",

                        createdAt:
                            serverTimestamp()

                    }
                );


                console.log(
                    "Reservasi berhasil disimpan ke Firestore."
                );


            } catch (error) {

                console.error(
                    "Gagal menyimpan ke Firestore:",
                    error
                );

                /*
                 * Untuk tahap prototype,
                 * reservasi tetap ditampilkan.
                 */

            }


            // ==================================================
            // 16. TAMPILKAN HASIL RESERVASI
            // ==================================================

            // Sembunyikan pembayaran
            const paymentSection =
                document.getElementById(
                    "paymentSection"
                );


            if (paymentSection) {

                paymentSection.style.display =
                    "none";

            }


            // Tampilkan reservasi
            if (reservationSection) {

                reservationSection.style.display =
                    "block";

            }


            // ------------------------------------------
            // KODE RESERVASI
            // ------------------------------------------

            if (
                reservationCodeElement
            ) {

                reservationCodeElement.textContent =
                    reservationCode;

            }


            // ------------------------------------------
            // NAMA USER
            // ------------------------------------------

            if (
                reservationNameElement
            ) {

                reservationNameElement.textContent =
                    `Reservasi atas nama ${namaUser}`;

            }


            // ------------------------------------------
            // NAMA PAKET
            // ------------------------------------------

            if (
                reservationPackageElement
            ) {

                reservationPackageElement.textContent =
                    packageData.packageName;

            }


            // ------------------------------------------
            // METODE PEMBAYARAN
            // ------------------------------------------

            if (
                reservationPaymentElement
            ) {

                reservationPaymentElement.textContent =
                    selectedPaymentMethod;

            }


            // ==================================================
            // 17. GENERATE QR CODE
            // ==================================================

            if (qrCodeElement) {

                // Bersihkan QR sebelumnya
                qrCodeElement.innerHTML = "";


                // Data yang dimasukkan ke QR
                const qrData =
                    JSON.stringify({

                        reservationCode:
                            reservationCode,

                        userId:
                            currentUser.uid,

                        event:
                            packageData.eventName,

                        package:
                            packageData.packageName

                    });


                // Generate QR
                new QRCode(
                    qrCodeElement,
                    {

                        text:
                            qrData,

                        width:
                            220,

                        height:
                            220,

                        correctLevel:
                            QRCode.CorrectLevel.H

                    }
                );

            }


            // ==================================================
            // 18. UBAH STATUS BUTTON
            // ==================================================

            payButton.textContent =
                "Pembayaran Berhasil";


            payButton.disabled =
                true;


            // ==================================================
            // 19. SCROLL KE TIKET
            // ==================================================

            if (
                reservationSection
            ) {

                reservationSection.scrollIntoView({
                    behavior: "smooth"
                });

            }


            console.log(
                "Reservasi:",
                reservationData
            );

        }
    );

}


// ==========================================================
// 20. TOMBOL KEMBALI KE BERANDA
// ==========================================================

if (homeButton) {

    homeButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================================
// 21. DEBUG
// ==========================================================

console.log(
    "================================"
);

console.log(
    "CHECKOUT SYSTEM READY"
);

console.log(
    "Package:",
    packageData
);

console.log(
    "================================"
);