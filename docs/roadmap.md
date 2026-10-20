# Roadmap Company Profile Generator

Dokumen ini menjadi sumber utama urutan kerja dan status proyek. Targetnya adalah alat produksi company profile yang bisa ditinjau, diekspor, dan dicetak.

## Posisi proyek saat ini

**Tahap: fondasi dan alur dasar simpan/muat telah ditulis; verifikasi langsung dari GitHub Pages masih menunggu.**

### Sudah tersedia

- Struktur awal repository, README, dan roadmap.
- Wizard responsif di index.html dengan pilihan skala Startup/UKM, Menengah, dan Korporat.
- frontend/js/app.js mempertahankan nilai antar langkah dan menyimpan draft lokal otomatis.
- Tombol simpan cloud membuat ID profil, mengirim data ke GAS, lalu mencoba memverifikasi penyimpanan dengan membaca profil kembali.
- Tombol muat cloud membaca profil menggunakan ID.
- URL GAS yang diberikan pengguna telah dikonfigurasi di frontend/js/app.js.
- gas/setup.gs membuat spreadsheet dan folder Drive, menyiapkan tab Profiles, lalu menyimpan ID ke Script Properties.
- setupProject() berhasil dijalankan pada 20 Oktober 2026; Execution log mengonfirmasi resource dibuat dan konfigurasi tersimpan.
- GAS Web App berhasil dideploy; health check mengembalikan { ok: true, service: "company-profile-api" }.
- gas/Code.gs menyediakan endpoint health, baca profil, dan simpan profil.

### Masih perlu dilakukan

- Uji alur simpan dan muat dari domain GitHub Pages dengan data percobaan.
- Pastikan GitHub Pages aktif dan versi terbaru sudah terbit.
- Lindungi API dari akses tulis/ubah yang tidak berwenang sebelum menyimpan data klien sungguhan.
- Belum ada upload gambar dari UI ke Drive.
- Belum ada live preview, template profil, tema warna, daftar isi otomatis, susunan halaman, atau ekspor PDF.
- Belum ada penggabungan legalitas maupun integrasi Gemini.

**Langkah aktif berikutnya:** buka UI yang terbit di GitHub Pages, simpan profil percobaan, catat ID yang ditampilkan, lalu muat profil itu kembali. Setelah alur tersebut terverifikasi dan akses API ditinjau, lanjutkan upload aset dan penyusunan template/preview.

## Spesifikasi dokumen

Form wizard mengumpulkan materi; template menyusunnya menjadi halaman. Mengganti template atau tema tidak boleh menghapus isi yang telah dimasukkan.

Urutan profil standar:

1. Cover depan: nama dan logo perusahaan, tagline, serta gambar utama.
2. Pembuka: profil singkat atau pesan sambutan.
3. Daftar isi otomatis dengan nomor halaman dari layout akhir.
4. Isi profil sesuai skala dan materi: sejarah, visi-misi, produk/layanan, organisasi, portofolio, legalitas, operasional, dan pencapaian.
5. Penutup atau ajakan.
6. Back cover: kontak, website, QR code opsional, serta satu gambar pilihan atau kolase sederhana.

Galeri dan dokumentasi terutama menjadi bagian portofolio di isi dokumen. Back cover boleh memakai gambar/kolase pilihan, tetapi tetap menyediakan ruang kontak yang mudah dibaca. Bagian yang datanya tidak tersedia disembunyikan atau ditandai untuk dilengkapi; template tidak mengarang fakta.

## Fase 1 — GAS, model data, dan UI dasar

- [x] Jalankan setupProject(); spreadsheet dan folder Drive berhasil dibuat dan ID tersimpan di Script Properties.
- [x] Deploy GAS Web App dan verifikasi endpoint health.
- [x] Implementasikan wizard yang mempertahankan isian saat berpindah langkah dan mengganti skala.
- [x] Implementasikan draft lokal serta kode simpan/muat profil dari GAS.
- [ ] Verifikasi alur simpan/muat langsung dari GitHub Pages.
- [ ] Tetapkan skema profil/aset dan validasi konsisten di frontend/backend.
- [ ] Validasi tipe dan ukuran gambar maksimum 1 MB sebelum Base64; validasi ulang di backend.
- [ ] Siapkan upload ke Drive dan simpan referensi file, bukan Base64 permanen di Sheets.
- [ ] Tetapkan akses API yang layak sebelum digunakan untuk data klien.

**Hasil fase:** data profil dapat diisi, disimpan, dimuat kembali, dan aset dapat dikelola.

## Fase 2 — Template, preview, dan PDF siap cetak

- Mulai dengan satu template profesional lengkap; tambah variasi setelah alur cetak stabil.
- Sediakan pilihan tema warna terkurasi dan opsi font. Tema hanya mengubah presentasi, bukan isi.
- Tampilkan preview halaman A4 210 × 297 mm, navigasi halaman, dan bagian yang perlu dilengkapi.
- Terapkan cover, pembuka, isi dinamis, daftar isi, penutup, dan back cover.
- Hitung daftar isi setelah pagination final agar nomor halaman akurat.
- Tempatkan galeri di isi dokumen; sediakan gambar/kolase pilihan untuk back cover.
- Sesuaikan bagian dan rentang halaman: Startup/UKM 4–8, Menengah 8–16, Korporat 20–40.
- Hitung halaman termasuk cover dan back cover; tambah halaman transisi/kosong hingga kelipatan empat dan tampilkan di preview.
- Tambahkan ekspor PDF A4 dengan html2pdf.js dan penggabungan legalitas dengan pdf-lib.js.
- Periksa pemenggalan konten, font, kualitas gambar, margin aman, bleed, dan urutan halaman.

**Hasil fase:** pengguna memilih template dan tema, meninjau seluruh halaman, lalu mengunduh PDF untuk cetak.

## Fase 3 — AI Copywriter dan penyempurnaan produk

- Simpan Gemini API key di Script Properties; jangan letakkan di frontend atau repository.
- Tambahkan Generate AI pada bidang teks yang relevan.
- Kirim poin mentah dengan konteks perusahaan, skala, bahasa, dan batas panjang.
- AI tidak menambahkan klaim/fakta yang tidak diberikan; hasil ditampilkan sebagai saran yang dapat diedit.
- Terapkan batas pemakaian, penanganan error, dan pencatatan pemakaian.
- Tinjau privasi, backup, kuota GAS, dan batas operasional sebelum penggunaan komersial.

**Hasil fase:** copywriting berbantuan AI tersedia dengan kontrol pengguna dan batas operasional jelas.

## Kriteria selesai

- Isi terjaga saat berpindah wizard, mengganti template/tema, menyimpan, dan memuat profil.
- Daftar isi sesuai halaman final dan semua halaman tampil di preview.
- Total halaman selalu kelipatan empat.
- PDF dapat diunduh dan lampiran legalitas dapat disertakan.
- Gambar di atas 1 MB ditolak sebelum dikirim ke GAS.
- AI hanya memberi saran dan tidak diam-diam mengganti konten.
