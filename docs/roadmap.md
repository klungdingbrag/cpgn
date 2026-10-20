# Roadmap Eksekusi

## Fase 1 — Setup GAS & UI Dasar

- Buat Google Sheet, folder Drive, dan Script Properties melalui `setupProject()`.
- Deploy GAS Web App dan hubungkan URL endpoint ke frontend.
- Implementasikan wizard adaptif untuk Startup/UKM, Menengah, dan Korporat.
- Validasi gambar ≤1 MB sebelum Base64; validasi payload di server juga.
- Lengkapi simpan/muat profil, indikator proses, dan pesan error.

## Fase 2 — PDF & Layouting Kelipatan 4

- Bangun preview A4 210 × 297 mm dan aturan pemisahan halaman.
- Hitung halaman aktual setelah konten masuk; tambahkan transisi/halaman kosong sampai kelipatan empat.
- Ekspor memakai html2pdf.js dan gabungkan lampiran legalitas dengan pdf-lib.js.
- Periksa hasil cetak: font, gambar tajam, margin aman, dan urutan halaman.

## Fase 3 — Gemini AI Copywriter

- Simpan Gemini API key di Script Properties, jangan di frontend atau repository.
- Tambahkan endpoint generate-copy dan prompt terstruktur per bidang.
- Minta AI mempertahankan fakta dari poin mentah dan menandai informasi yang belum ada.
- Berikan pratinjau/edit sebelum hasil menggantikan teks; tambahkan kuota dan audit pemakaian.

