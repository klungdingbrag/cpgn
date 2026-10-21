# Roadmap Company Profile Generator

Dokumen ini menjadi sumber utama urutan kerja dan status proyek. Targetnya adalah alat produksi company profile yang bisa ditinjau, diekspor, dan dicetak.

## Posisi proyek saat ini

**Tahap: fondasi, setup GAS, dan alur simpan/muat profil sudah berhasil digunakan. Tahap berikutnya adalah template dan preview dokumen.**

### Sudah tersedia dan diverifikasi

- Struktur awal repository, README, dan roadmap.
- Wizard responsif di index.html dengan pilihan skala Startup/UKM, Menengah, dan Korporat.
- frontend/js/app.js mempertahankan nilai antar langkah dan menyimpan draft lokal otomatis.
- Tombol simpan cloud membuat ID profil, mengirim data ke GAS, lalu memverifikasi dengan membaca profil kembali.
- Tombol muat cloud membaca profil menggunakan ID.
- Pengguna telah mengonfirmasi pembuatan ID, penyimpanan, dan pemuatan ulang profil berhasil dari UI pada 21 Oktober 2026; satu penyimpanan cloud tambahan juga menghasilkan ID profil dengan sukses.
- URL GAS didefinisikan pada frontend/js/app.js.
- gas/setup.gs membuat spreadsheet dan folder Drive, menyiapkan tab Profiles, lalu menyimpan ID ke Script Properties.
- setupProject() berhasil dijalankan pada 20 Oktober 2026.
- GAS Web App berhasil dideploy; health check mengembalikan { ok: true, service: "company-profile-api" }.
- gas/Code.gs menyediakan endpoint health, baca profil, dan simpan profil.

### Masih perlu dilakukan

- Lindungi API dari akses tulis/ubah yang tidak berwenang sebelum menyimpan data klien sungguhan.
- Strukturkan produk, layanan, portofolio, dan aset menjadi data yang dapat ditata per halaman.
- Belum ada upload gambar dari UI ke Drive.
- Belum ada live preview, template profil, tema warna, daftar isi otomatis, susunan halaman, atau ekspor PDF.
- Belum ada penggabungan legalitas maupun integrasi Gemini.

**Langkah aktif berikutnya:** mulai Fase 2 dengan mendefinisikan data dokumen terstruktur dan membangun satu template profesional dengan preview A4. Preview awal memakai placeholder gambar; upload gambar, daftar isi final, dan ekspor PDF menyusul dalam fase yang sama.

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
- [x] Implementasikan draft lokal serta simpan/muat profil dari GAS.
- [x] Verifikasi langsung dari pengguna bahwa simpan dan muat ulang profil berhasil.
- [ ] Tetapkan skema profil/aset dan validasi konsisten di frontend/backend.
- [ ] Lindungi akses API sebelum digunakan dengan data klien.
- [ ] Validasi tipe dan ukuran gambar maksimum 1 MB sebelum Base64; validasi ulang di backend.
- [ ] Siapkan upload ke Drive dan simpan referensi file, bukan Base64 permanen di Sheets.

**Hasil fase:** profil dasar dapat disimpan dan dimuat. Pengamanan akses dan pengelolaan aset masih perlu diselesaikan sebelum data klien sungguhan.

## Fase 2 — Template, preview, dan PDF siap cetak

1. Definisikan model dokumen terstruktur untuk kontak, produk/layanan, portofolio, dan bagian opsional.
2. Implementasikan satu template profesional end-to-end: cover, pembuka, isi, daftar isi, penutup, back cover.
3. Tambahkan pemilih tema warna terkurasi dan preview A4 210 × 297 mm per halaman.
4. Tambahkan upload gambar maksimum 1 MB, validasi, dan penyimpanan aset ke Drive.
5. Hitung daftar isi dari pagination final.
6. Sesuaikan isi dan rentang halaman menurut paket: Startup/UKM 4–8, Menengah 8–16, Korporat 20–40.
7. Tambah halaman transisi/kosong hingga jumlah halaman termasuk cover/back cover menjadi kelipatan empat.
8. Tambahkan ekspor PDF A4 memakai html2pdf.js dan penggabungan legalitas dengan pdf-lib.js.
9. Periksa pemenggalan konten, font, kualitas gambar, margin aman, bleed, dan urutan halaman.
10. Setelah alur cetak stabil, tambahkan template alternatif dan pilihan layout galeri/back cover.

**Hasil fase:** pengguna memilih template dan tema, meninjau seluruh halaman, lalu mengunduh PDF yang siap dicetak.

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
