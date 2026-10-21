# Company Profile Generator

Mesin produksi company profile. Frontend statis berjalan di GitHub Pages; Google Apps Script menangani API, Google Sheets menyimpan profil, dan Google Drive menyimpan gambar.

## Status proyek

Alur simpan/muat profil sudah dikonfirmasi berhasil oleh pengguna. Di repo kini tersedia editor produk dan portofolio terstruktur, satu template Executive Modern, tiga tema warna, preview A4, upload gambar privat ke Drive, daftar isi otomatis, dan ekspor PDF A4.

**Perlu langkah manual:** backend GAS yang sedang ter-deploy harus diperbarui dari gas/Code.gs dan dideploy sebagai versi baru. Setelah itu, fitur upload gambar dan tema perlu diuji langsung melalui GitHub Pages. Gunakan data percobaan saja sampai API memiliki autentikasi dan perlindungan penyalahgunaan. Lihat [roadmap](docs/roadmap.md) untuk status lengkap.

## Struktur repository

- index.html — UI wizard, template/theme controls, preview dialog
- frontend/css/styles.css — form dan halaman A4
- frontend/js/app.js — state, profil cloud, item terstruktur, upload, pagination, dan ekspor PDF
- frontend/assets/ — aset frontend
- gas/setup.gs — membuat spreadsheet/folder Drive
- gas/Code.gs — API profil dan gambar
- docs/roadmap.md — posisi dan tahapan proyek

## Frontend

GitHub Pages disetel dari Settings → Pages, branch main, folder root. Frontend menggunakan Tailwind CDN dan html2pdf.js CDN untuk prototipe.

Fitur saat ini:

- Form bertahap berdasarkan skala bisnis.
- Produk dan portofolio dapat ditambahkan sebagai item terpisah.
- Tema Teal Executive, Navy Trust, dan Earth & Craft.
- Template pertama: Executive Modern, dengan cover, daftar isi, isi profil, halaman transisi, dan back cover.
- Upload JPG/PNG/WebP maksimum 1 MB per gambar. File disimpan privat di Drive.
- Preview halaman A4 dan ekspor PDF; engine menambahkan halaman transisi sebelum back cover hingga jumlah halaman kelipatan empat.
- Jumlah halaman paket ditampilkan sebagai target. Komposisi aktual bergantung pada kelengkapan konten.

## Setup dan pembaruan Google Apps Script

### Setup pertama kali

1. Buat project di https://script.google.com.
2. Salin gas/setup.gs dan gas/Code.gs dari repository ke project Apps Script.
3. Jalankan setupProject() dan setujui izin Google.
4. Fungsi membuat spreadsheet serta folder Drive, menyiapkan tab Profiles, dan mencatat ID di Script Properties.
5. Lihat Execution log untuk tautan resource.

### Memperbarui project GAS yang sudah ada

1. Buka project Apps Script yang dipakai deployment.
2. Ganti isi Code.gs dengan versi terbaru dari repo: [gas/Code.gs](../gas/Code.gs).
3. Simpan perubahan. Kode menambahkan kolom theme ke baris header saat API dipanggil; tidak perlu menghapus data atau membuat spreadsheet baru.
4. Pilih Deploy → Manage deployments, edit deployment Web App yang sudah ada, pilih New version, lalu Deploy.
5. Beri izin yang diminta jika Apps Script memintanya. URL /exec pada deployment yang sama tetap dipakai frontend.
6. Uji upload gambar, simpan/muat profil, dan tema menggunakan data percobaan.

Tidak perlu menjalankan setupProject() ulang untuk pembaruan ini. setup.gs hanya perlu diganti bila menyiapkan project baru.

## API dan keamanan

Frontend membaca profil melalui JSONP dan menyimpan/mengunggah melalui POST sederhana. Endpoint upload memvalidasi MIME JPG/PNG/WebP serta batas 1 MB di backend; Drive menyimpan file secara privat. UI mengambil gambar melalui endpoint dengan ID profil dan aset.

API saat ini belum memiliki autentikasi pengguna atau pembatasan penyalahgunaan. Endpoint publik dan ID profil/aset bukan pengganti autentikasi. Jangan simpan informasi klien yang sensitif atau dokumen legalitas sampai kontrol akses, validasi, kuota, dan kebijakan data ditetapkan. Jangan masukkan token rahasia ke frontend publik.

## Arah produk

Materi diisi sekali lalu disusun template menjadi cover depan, pembuka, daftar isi otomatis, isi profil, penutup, dan back cover. Portofolio memuat dokumentasi proyek; back cover dapat memakai gambar pilihan dengan kontak yang tetap terbaca. Berikutnya: uji layout PDF, rapikan pagination, gabungkan lampiran legalitas memakai pdf-lib.js, lalu kembangkan template alternatif dan Gemini Copywriter.
