# Roadmap Company Profile Generator

Dokumen ini menjadi sumber utama urutan kerja dan status proyek. Targetnya adalah alat produksi company profile yang bisa ditinjau, diekspor, dan dicetak.

## Posisi proyek saat ini

**Tahap: alur simpan/muat profil telah terverifikasi. Fase 2 versi awal sudah ditulis di repo, menunggu backend GAS diperbarui dan fitur dokumen diuji langsung.**

### Sudah tersedia dan pernah diverifikasi

- Wizard responsif untuk Startup/UKM, Menengah, dan Korporat.
- Draft lokal, simpan profil ke GAS, serta muat ulang berdasarkan ID. Pengguna mengonfirmasi alur ini berhasil pada 21 Oktober 2026.
- Setup GAS membuat spreadsheet/folder Drive dan menyimpan ID di Script Properties; health check pernah berhasil.
- Satu template awal bernama Executive Modern dengan cover, daftar isi bernomor, halaman isi, halaman transisi, dan back cover.
- Editor produk dan portofolio terstruktur sebagai item terpisah; portofolio dapat memiliki foto.
- Pilihan tiga tema warna dan preview halaman A4.
- Kode client-side untuk validasi gambar maksimal 1 MB, upload gambar privat ke Drive, dan pemuatan gambar melalui endpoint GAS.
- Ekspor PDF A4 memakai html2pdf.js; engine menambahkan halaman transisi sebelum back cover hingga total halaman kelipatan empat.

### Menunggu penerapan dan verifikasi

- gas/Code.gs terbaru harus disalin ke project Apps Script dan Web App dideploy dengan versi baru. Backend deployment lama belum memiliki endpoint upload/getAsset dan migrasi kolom tema.
- Uji dari GitHub Pages: upload gambar, simpan/muat item terstruktur dan tema, lalu unduh PDF.
- Periksa jumlah/ukuran halaman pada browser dan hasil PDF; rentang paket saat ini ditampilkan sebagai target, belum dipaksakan oleh engine.
- Akses API belum memiliki autentikasi atau pembatasan penyalahgunaan. Gunakan data percobaan saja.
- Belum ada penggabungan dokumen legalitas dengan pdf-lib.js maupun integrasi Gemini.

**Langkah aktif berikutnya:** perbarui Code.gs di Apps Script, deploy versi baru pada deployment yang sama, lalu uji alur gambar dan PDF. Setelah itu perbaiki temuan render/cetak dan rancang perlindungan API sebelum data klien sungguhan.

## Spesifikasi dokumen

Form wizard mengumpulkan materi; template menyusunnya menjadi halaman. Mengganti template atau tema tidak boleh menghapus isi yang telah dimasukkan.

Urutan profil standar:

1. Cover depan: nama/logo perusahaan, tagline, dan gambar utama.
2. Pembuka atau ringkasan perusahaan.
3. Daftar isi otomatis berdasarkan halaman hasil layout.
4. Isi profil sesuai skala dan materi: sejarah, visi-misi, produk/layanan, organisasi, portofolio, legalitas, operasional, dan pencapaian.
5. Penutup atau ajakan.
6. Back cover: kontak, website, QR code opsional, dan gambar pilihan.

Galeri/dokumentasi berada terutama pada bagian portofolio. Back cover dapat memakai satu gambar pilihan dengan kontak yang tetap terbaca. Bagian tanpa data dihilangkan atau diberi petunjuk; template tidak mengarang fakta.

## Fase 1 — GAS, model data, dan UI dasar

- [x] Setup spreadsheet dan folder Drive melalui setupProject().
- [x] Deploy GAS Web App dan verifikasi health check.
- [x] Wizard mempertahankan isian saat berpindah langkah/skala.
- [x] Draft lokal dan simpan/muat profil cloud berdasarkan ID.
- [x] Pengguna mengonfirmasi simpan dan muat ulang berhasil.
- [x] Skema dasar profil tersedia di Sheets.
- [ ] Tambahkan autentikasi/otorisasi dan mitigasi penyalahgunaan sebelum data klien.
- [ ] Tinjau skema baru dan validasi upload saat backend diperbarui.

**Hasil fase:** alur data dasar berfungsi untuk uji coba. Keamanan produksi belum selesai.

## Fase 2 — Template, preview, dan PDF siap cetak

- [x] Data produk dan portofolio disusun sebagai item terpisah.
- [x] Template pertama: cover, daftar isi, bagian isi, kontak, transisi, dan back cover.
- [x] Pemilih tema warna dan preview A4 210 × 297 mm.
- [x] Validasi gambar maksimum 1 MB di UI dan GAS; simpan file secara privat di Drive.
- [x] Nomor daftar isi dihitung dari halaman isi final; daftar isi dapat berlanjut ke beberapa halaman.
- [x] Halaman transisi ditambahkan sebelum back cover untuk menjaga total kelipatan empat.
- [x] Ekspor PDF A4 menggunakan html2pdf.js.
- [ ] Salin backend terbaru ke Apps Script dan deploy versi Web App baru.
- [ ] Uji upload gambar, simpan/muat tema serta item, dan ekspor PDF di GitHub Pages.
- [ ] Perbaiki pagination, font, foto, margin aman, dan rentang paket berdasarkan hasil cetak.
- [ ] Tambahkan penggabungan lampiran legalitas dengan pdf-lib.js.
- [ ] Tambahkan template alternatif setelah template pertama stabil.

**Hasil fase:** versi awal halaman profil sudah dikodekan; verifikasi runtime dan kualitas cetak masih diperlukan.

## Fase 3 — AI Copywriter dan penyempurnaan produk

- Simpan Gemini API key di Script Properties; jangan letakkan di frontend atau repository.
- Tambahkan Generate AI pada bidang teks yang relevan.
- Kirim poin mentah dengan konteks perusahaan, skala, bahasa, dan batas panjang.
- AI tidak menambahkan klaim/fakta yang tidak diberikan; hasil ditampilkan sebagai saran yang dapat diedit.
- Terapkan batas pemakaian, penanganan error, dan pencatatan pemakaian.
- Tinjau privasi, backup, kuota GAS, dan batas operasional sebelum penggunaan komersial.

## Kriteria selesai

- Isi terjaga saat berpindah wizard, mengganti template/tema, menyimpan, dan memuat profil.
- Daftar isi sesuai halaman final dan seluruh halaman tampil di preview.
- PDF A4 memiliki jumlah halaman kelipatan empat dan back cover menjadi halaman terakhir.
- Gambar lebih dari 1 MB ditolak sebelum dikirim.
- File gambar di Drive tetap privat.
- AI hanya memberi saran dan tidak mengganti konten tanpa tindakan pengguna.
