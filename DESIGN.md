# Arah desain TryOutku

Dokumen ini mencatat arah visual yang dipakai, alasannya, dan hal yang sengaja tidak dipakai. Aturan antislop meminta setiap teknik punya alasan tertulis; itulah isi file ini.

## Arah: kertas ujian

Produk ini soal lembar soal dan pensil, bukan dashboard SaaS. Arah visualnya diambil dari kertas ujian cetak: kertas gading, tinta hampir hitam, garis rambut, angka tabular.

- **Kenapa bukan ungu-biru gradien**: tidak ada hubungannya dengan ujian. Warna itu default AI, bukan identitas produk.
- **Kenapa serif untuk judul**: lembar soal dan buku pelajaran dicetak dengan serif. Plex Serif memberi kesan dokumen, bukan aplikasi.
- **Kenapa garis rambut, bukan kartu bertumpuk**: garis memisahkan tanpa mengangkat. Kartu berbayang di semua elemen membuat halaman terasa melayang tanpa hierarki.
- **Kenapa satu aksen**: aksen tunggal (hijau pinus) menandai aksi utama saja. Merah bata hanya untuk salah dan hapus, karena dua warna status itu memang perlu dibedakan.

## Palet

| Peran | Terang | Gelap | Alasan |
| --- | --- | --- | --- |
| Kertas | `#F6F2E9` | `#161613` | Putih murni terlalu steril untuk produk cetak; gading meniru kertas |
| Permukaan | `#FFFDF7` | `#1E1E1A` | Kartu sedikit lebih terang dari kertas agar terbaca tanpa bayangan |
| Tinta | `#1A1815` | `#ECE8DE` | Kontras 15,9:1 dan 14,8:1 |
| Redup | `#5C574E` | `#A8A296` | 6,4:1 dan 7,1:1, tetap lolos AA |
| Garis | `#D9D2C3` | `#3A3830` | Pemisah, bukan dekorasi |
| Aksen | `#1F4B3F` | `#7EB29E` | 8,8:1 di kertas; dipakai untuk aksi utama dan status benar |
| Bahaya | `#8C3B2E` | `#D67A6A` | 6,8:1, hanya untuk jawaban salah dan aksi hapus |

Semua pasangan teks di atas diukur dengan rumus kontras WCAG dan lolos ambang AA (4,5:1 teks normal).

## Tipografi

- **Judul**: IBM Plex Serif 600/700. Alasan: keluarga Plex dirancang untuk keterbacaan dokumen, dan serif memisahkan judul dari data.
- **Isi**: IBM Plex Sans 400/500/600. Alasan: tabel dan angka kecil butuh sans yang netral; Plex Sans punya angka tabular.
- **Angka waktu dan soal**: IBM Plex Mono dengan `font-variant-numeric: tabular-nums` supaya timer tidak menggeser lebar setiap detik.

## Bentuk dan gerak

- Radius 6px untuk kartu dan tombol, 4px untuk sel navigasi. Pil hanya untuk label status yang memang berbentuk label.
- Tanpa gradien, tanpa `backdrop-blur` di navbar dan kartu, tanpa glow. Satu-satunya gerak adalah kemunculan hasil dan transisi soal, karena menandai konten baru.
- Fokus keyboard selalu terlihat: outline 2px warna aksen dengan offset 2px.

## Yang sengaja tidak dipakai

- Gradien ungu-biru dan teks bergradien.
- Badge pil di atas judul, titik status dekoratif, emoji sebagai ikon.
- Bagian "tiga langkah" dengan ikon bulat seragam.
- Statistik karangan. Angka yang tampil (jumlah soal, jumlah subtes, jumlah paket) dihitung dari bank soal saat build.

## Status dokumen

Arah ini disusun tanpa arahan brand dari pemilik produk, karena belum ada. Anggap sebagai usulan yang bisa diganti; begitu ada arahan resmi (warna, font, nada), dokumen ini yang pertama diperbarui.
