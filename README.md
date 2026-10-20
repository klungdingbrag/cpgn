# Company Profile Generator

Mesin produksi company profile untuk layanan desain dan penerbitan bisnis. Frontend statis berjalan di GitHub Pages; Google Apps Script menangani API, Google Sheets menyimpan data, dan Google Drive menyimpan aset.

## Status proyek

**Fondasi starter tersedia dan setup resource Google selesai; aplikasi masih pada tahap awal.** setupProject() berhasil dijalankan pada 20 Oktober 2026 dan membuat spreadsheet serta folder Drive, lalu menyimpan konfigurasi di Script Properties. Wizard skala bisnis dan boilerplate GAS sudah ada, tetapi form belum terhubung ke penyimpanan cloud. Preview halaman, template, tema, daftar isi otomatis, ekspor PDF, upload, dan Gemini belum diimplementasikan. Detail status dan tahapan kerja ada di [docs/roadmap.md](docs/roadmap.md).

## Arsitektur

Frontend GitHub Pages → wizard input → template → preview A4 → ekspor PDF.
Google Apps Script menangani API, Sheets menyimpan satu baris per profileId, Drive menyimpan aset, dan Gemini untuk copywriting pada fase 3.

## Struktur repository

- index.html
- frontend/css/styles.css
- frontend/js/app.js
- frontend/assets/logo.svg dan placeholders/
- gas/setup.gs
- gas/Code.gs
- docs/roadmap.md

Saat ini wizard starter berada di index.html. CSS dan JavaScript terpisah disiapkan sebagai struktur pengembangan lanjutan.

## Setup Google Apps Script

1. Buat project di https://script.google.com.
2. Tambahkan file setup.gs dan Code.gs dengan menyalin isi dari folder gas/ di repository.
3. Jalankan setupProject() dari editor Apps Script dan setujui izin Google.
4. Fungsi membuat spreadsheet dan folder Drive otomatis, menyiapkan tab Profiles, dan menyimpan ID di Script Properties.
5. Buka Execution log untuk tautan spreadsheet dan folder. Pemanggilan ulang memakai resource sama dan tidak membuat duplikat.

## Deploy frontend dan API

1. Aktifkan GitHub Pages dari Settings → Pages dan pilih branch main dengan folder root.
2. Deploy GAS sebagai Web app dan salin URL /exec.
3. Hubungkan URL endpoint ke frontend ketika integrasi API dikerjakan.

Endpoint GET dapat memakai JSONP untuk baca sederhana. Penyimpanan memakai POST; browser dapat menghadapi redirect/CORS saat memanggil GAS. JSONP bukan autentikasi dan tidak boleh membawa rahasia. Sebelum menyimpan data klien, tetapkan autentikasi, validasi, pembatasan penyalahgunaan, serta kebijakan akses.

## Arah produk

Pengguna mengisi data satu kali, lalu memilih template dan tema warna. Template menyusun cover depan, pembuka, daftar isi otomatis, isi profil, penutup, dan back cover. Galeri menjadi bagian portofolio; back cover dapat memakai satu gambar atau kolase dengan informasi kontak yang tetap terbaca.

Preview menampilkan halaman A4. Nomor daftar isi dihitung dari pagination final. Cover dan back cover ikut dihitung; hasil saddle stitch ditambah halaman transisi/kosong agar jumlah halaman kelipatan empat. Skala paket menentukan rentang halaman dan bagian yang tersedia.

## Teknologi target

- HTML5, Vanilla JavaScript, Tailwind CSS
- Google Apps Script, Google Sheets, Google Drive
- html2pdf.js untuk ekspor PDF client-side
- pdf-lib.js untuk menggabungkan lampiran PDF
- Gemini API dari GAS dengan key di Script Properties

Biaya layanan pihak ketiga, kuota Google, dan batas operasional perlu ditinjau sebelum menawarkan SLA atau menyimpan data klien dalam skala besar.
