# Role & Context
Kamu adalah seorang Full-Stack Developer ahli yang berfokus pada UI/UX yang elegan, modern, dan integrasi database Supabase.
Proyek ini adalah "Grade Hustle": Aplikasi manajemen nilai akademik dengan fitur perhitungan IPK/IPS dinamis, proyeksi sisa nilai, simulator kelulusan, dan sistem validasi realita (The Extortionist Engine). SELURUH KONTEN (termasuk menu, tombol, dan peringatan) HARUS DIMUAT DALAM BAHASA INGGRIS.

# Tech Stack
- Frontend: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- Backend: Supabase (PostgreSQL, Google Auth).

# Strict UI/UX Rules (WAJIB DIIKUTI)
- **Tema Visual**: Desain antarmuka harus sangat ELEGAN, MINIMALIS, CANTIK, dan USER-FRIENDLY. Gunakan banyak whitespace, palet warna yang lembut/premium, tipografi sans-serif yang modern, dan *custom transparent scrollbar*.
- **Komponen UI**: Gunakan desain berbasis kartu (card-based layout) dengan border-radius (rounded corners) dan bayangan yang sangat tipis (subtle drop shadows). Hindari elemen visual yang berlebihan.
- **Interaksi & Animasi**: Buat navigasi se-intuitif mungkin. Gunakan transisi CSS yang sangat halus (smooth hover effects, fade-in/out). **DILARANG KERAS menggunakan `alert()`, `prompt()`, atau `confirm()` bawaan browser.** Semua notifikasi/input harus menggunakan UI kustom (toast/modal) yang estetis.
- **Live UI Updates**: Perhitungan dan *update* UI (seperti label IPS, IPK, dan nilai huruf akhir) harus dilakukan secara *real-time* via manipulasi DOM langsung, tanpa me-*refresh* ulang komponen atau memanggil dari *database* terus-menerus, untuk mencegah kedipan UI dan hilangnya *focus input* pengguna.
- **Form UX**: Matikan fitur *scroll-wheel* mouse dan tombol spinner (tanda panah) bawaan browser pada semua input bertipe angka (number). Pada *view* "Grade Input", *input* nama dan *weight* harus dikunci secara keras (*readonly* & `tabIndex=-1`) agar user hanya bisa fokus menginput *Score*.

# Strict Logic & Validation Rules
- **Mandatory Onboarding**: Setelah login Google berhasil, cek status pengguna. Jika belum memiliki konfigurasi skala nilai (A, B, C, D, E), paksa pengguna masuk ke halaman Onboarding untuk menginput batas bawah angka setiap huruf (misal A minimum 85) beserta bobot IPK-nya (A = 4.0).
- **The Extortionist Engine (Realism Check)**: 
  - Jika target huruf yang dipilih *user* tidak mungkin lagi dicapai secara matematis (sekalipun sisa komponen dapat 100), tampilkan teks realita ("Mathematically Impossible") pada panel proyeksi, dan beritahu nilai maksimal apa yang masih mungkin dicapai. JANGAN MENGUBAH *DROPDOWN* TARGET SECARA PAKSA!
  - Jika *user* berhasil melampaui target yang ditetapkan (*overachiever*), berikan apresiasi ("Outstanding!") pada panel.
- **Proteksi Bobot Maksimal**: Total bobot persen (*weight*) seluruh komponen dalam satu mata kuliah tidak boleh lebih dari 100%. Sistem harus secara otomatis memotong (cap) input angka *user* jika melebihi sisa sisa bobot, dan menonaktifkan tombol "+ Add Component" jika totalnya sudah menyentuh 100%.
- **Semester Accordion**: Jika terdapat lebih dari 1 semester di *dashboard*, otomatis tutup (*collapse*) semester yang lama untuk menjaga UI tetap bersih dan rapi. Pengguna dapat mengeklik judul semester yang dilengkapi ikon panah (*chevron*) untuk membuka-tutup isinya.

# Core Features
1. Autentikasi Supabase via Google dengan halaman login yang minimalis.
2. Pengaturan skala nilai huruf kustom (Input mandiri oleh user saat *onboarding*).
3. CRUD Semester, Mata Kuliah (SKS), dan Komponen Nilai (bobot persentase).
4. Kalkulasi IPS, IPK Total, Total SKS, dan Distribusi Nilai secara otomatis dan *real-time* pada Profil Mahasiswa.
5. **Graduation Simulator**: Kalkulator *backtracking* (DFS) tingkat lanjut yang memungkinkan pengguna merencanakan kelulusannya:
   - **Minimum Acceptable Grade**: *User* dapat memasukkan batas nilai paling jelek yang masih mau mereka terima (secara *default* otomatis menargetkan C atau ekuivalen 2.0). Algoritma akan membuang (pruning) semua kemungkinan di bawah batas ini.
   - **Alternative Strategies**: Alih-alih hanya memberikan 1 jawaban, algoritma akan mencari miliaran kombinasi lalu menyaring dan menampilkan hingga **3 skenario terbaik (termudah)** dalam bentuk tumpukan *cards* UI yang elegan (misal: "Option 1: The Bare Minimum", "Option 2: Alternative Mix").
   - **Floating Point Math Handling**: Jika IPK maksimum yang bisa diraih memiliki selisih pembulatan yang rancu dengan target (misal target 3.91 tapi maksimal 3.908), sistem otomatis mencetak 4 angka desimal detail untuk membedah fakta matematis tersebut agar *user* paham.