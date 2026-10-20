# Company Profile Generator

Mesin produksi company profile untuk layanan desain dan penerbitan bisnis. Starter ini memisahkan UI statis, API Google Apps Script, data Google Sheets, dan file Google Drive agar biaya operasional awal tetap rendah.

## Arsitektur

```text
Browser (GitHub Pages)
  ├─ HTML + Tailwind CDN + Vanilla JS
  ├─ Preview A4 / ekspor PDF (tahap berikutnya: html2pdf.js, pdf-lib.js)
  └─ JSONP GET → Google Apps Script Web App
                    ├─ Google Sheets: satu baris per profileId
                    ├─ Google Drive: gambar dan PDF
                    └─ Gemini API (tahap 3)
```

Frontend adalah aplikasi statis. GAS menjadi API dan memakai `PropertiesService` untuk ID spreadsheet, folder Drive, serta kunci Gemini. Deploy Web App dengan akses yang sesuai kebutuhan bisnis. Untuk produksi, pertimbangkan autentikasi dan otorisasi per klien; URL Web App publik bukan mekanisme autentikasi.

### Pohon repository

```text
company-profile-generator/
├── index.html
├── README.md
├── frontend/
│   ├── css/styles.css
│   ├── js/app.js
│   └── assets/
│       ├── logo.svg
│       └── placeholders/       # gambar contoh / placeholder
├── gas/
│   ├── setup.gs                # dijalankan manual sekali dari editor GAS
│   └── Code.gs                 # endpoint doGet/doPost dan operasi data
└── docs/
    └── roadmap.md
```

`index.html` memuat wizard dasar secara mandiri agar mudah dicoba. Saat pengembangan berlanjut, pindahkan CSS/JS inline ke `frontend/`.

## Setup dan deploy

### Frontend

1. Buat repository GitHub dan salin isi folder starter ini.
2. Pada GitHub, buka **Settings → Pages**, pilih branch dan folder root, lalu simpan.
3. Buka URL Pages yang diberikan GitHub. Tailwind dimuat dari CDN untuk prototipe; untuk produksi, build CSS statis dan pin dependensi.
4. Masukkan URL Web App GAS pada `GAS_ENDPOINT` di `index.html`.

### Google Sheets dan Drive

1. Buat spreadsheet serta folder Drive untuk aset klien.
2. Buat project Google Apps Script, lalu tambahkan `gas/setup.gs` dan `gas/Code.gs`.
3. Jalankan fungsi `setupProject()` sekali dari editor GAS. Isi `SPREADSHEET_ID` dan `DRIVE_FOLDER_ID` melalui prompt; fungsi membuat tab `Profiles` dan menyimpan ID di Script Properties.
4. Tinjau izin yang diminta dan jalankan dengan akun pemilik data.

### Deploy GAS Web App

1. **Deploy → New deployment → Web app**.
2. Pilih eksekusi sebagai pemilik deployment. Atur siapa yang dapat mengakses sesuai kebijakan Anda.
3. Salin URL `/exec` ke konfigurasi frontend.
4. Uji `?action=health&callback=cb` di browser.

Endpoint GET memakai JSONP untuk pembacaan sederhana. POST lintas origin ke Apps Script dapat memicu redirect dan kebijakan CORS browser. Boilerplate menyediakan `doPost` untuk penyimpanan, tetapi UI awal belum mengirim write ke server. JSONP dan token rahasia di JavaScript publik tidak layak untuk data sensitif; gunakan autentikasi, validasi, dan kontrol akses yang sesuai.

## Skema data

Satu baris per `profileId`. Kolom meliputi paket/skala bisnis, informasi perusahaan, sejarah, visi-misi, produk, kontak, organisasi, portofolio, legalitas, data operasional kompleks, laporan pencapaian, file, dan timestamp. Kolom tambahan didefinisikan pada `HEADERS` di `gas/Code.gs`.

## Roadmap eksekusi

### Fase 1 — Setup GAS & UI dasar

- Siapkan spreadsheet, Drive, Script Properties, endpoint health/read/save, dan validasi payload.
- Bangun wizard berdasarkan Startup/UKM, Menengah, dan Korporat.
- Validasi ukuran gambar maksimum 1 MB di browser sebelum konversi Base64.
- Tambahkan penyimpanan draft dan status request yang jelas.

### Fase 2 — PDF & layout kelipatan 4

- Bentuk live preview menjadi halaman A4 `210mm × 297mm` dengan ukuran dan margin konsisten.
- Susun konten berdasarkan paket, pecah konten berlebih secara terkontrol, dan cegah elemen terpotong.
- Hitung halaman hasil render; tambahkan halaman transisi atau kosong hingga jumlahnya kelipatan 4.
- Tambahkan `html2pdf.js` untuk ekspor dan `pdf-lib.js` untuk menggabungkan PDF legalitas.
- Verifikasi hasil cetak di ukuran fisik, termasuk font, gambar, bleed, dan batas aman.

### Fase 3 — Gemini AI Copywriter

- Tambahkan aksi `generateCopy` di GAS yang membaca Gemini key dari Script Properties.
- Kirim poin mentah dengan konteks field, skala bisnis, bahasa, batas panjang, dan instruksi agar tidak mengarang fakta.
- Tampilkan hasil sebagai saran yang dapat ditinjau dan diedit sebelum mengganti teks.
- Terapkan kuota, batas panjang, penanganan error, dan pencatatan pemakaian.

## Batasan starter

Kode ini fondasi prototipe, belum layanan multi-tenant siap produksi. Endpoint write perlu autentikasi, anti-abuse/rate limiting, kebijakan privasi, backup, dan kontrol akses. GAS memiliki kuota serta batas eksekusi; evaluasi sebelum menjanjikan SLA. Integrasi upload, PDF, dan Gemini belum diaktifkan pada UI starter.

