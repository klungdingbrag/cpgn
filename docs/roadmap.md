# Roadmap Company Profile Generator

Dokumen ini menjadi sumber utama urutan kerja dan status proyek. Targetnya adalah alat produksi company profile yang bisa ditinjau, diekspor, dan dicetak.

## Posisi proyek saat ini

**Tahap: fondasi starter tersedia; implementasi aplikasi belum dimulai penuh.**

### Sudah tersedia

- Struktur awal repository, README, dan roadmap.
- index.html dengan wizard dasar dan pilihan skala Startup/UKM, Menengah, dan Korporat.
- gas/setup.gs membuat spreadsheet dan folder Drive otomatis, menyiapkan tab Profiles, lalu menyimpan ID ke Script Properties. Pemanggilan ulang memakai resource yang sama.
- gas/Code.gs menyediakan endpoint dasar health, baca profil, dan simpan profil.

### Belum tersedia

- Wizard belum terhubung ke API GAS; draft saat ini hanya tersimpan di browser.
- Belum ada upload gambar dari UI ke Drive.
- Belum ada live preview, template profil, tema warna, daftar isi otomatis, susunan halaman, atau ekspor PDF.
- Belum ada penggabungan legalitas maupun integrasi Gemini.

**Langkah aktif berikutnya:** rapikan model data dan state wizard, lalu sambungkan simpan/muat profil melalui GAS. Setelah alur data stabil, bangun preview dan template sebagai satu alur dokumen.

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

- Jalankan setupProject() dan verifikasi resource pada akun Google pemilik.
- Tetapkan skema profil, aset, bagian dokumen, dan skala bisnis.
- Pertahankan nilai form saat berpindah langkah atau mengganti skala.
- Hubungkan simpan/muat profil dengan GAS dan tampilkan status/error.
- Validasi tipe dan ukuran gambar maksimum 1 MB sebelum Base64; validasi ulang di backend.
- Siapkan upload ke Drive dan simpan referensi file, bukan Base64 permanen di Sheets.
- Tetapkan akses API yang layak sebelum digunakan untuk data klien.

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
