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

## Empat tema

Pengguna memilih tema di halaman profil. Bawaannya kertas, dan pilihan disimpan di perangkat.

| Tema | Kertas | Permukaan | Tinta | Redup | Garis | Aksen | Rasio teks terendah |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kertas | `#F6F2E9` | `#FFFDF7` | `#1A1815` | `#5C574E` | `#D9D2C3` | `#1F4B3F` | 6,4:1 |
| Putih | `#FFFFFF` | `#FDFDFB` | `#111111` | `#54524E` | `#D0D0CA` | `#194B3E` | 7,7:1 |
| Gelap | `#161613` | `#1E1E1A` | `#ECE8DE` | `#A8A296` | `#3A3830` | `#7EB29E` | 6,6:1 |
| OLED | `#000000` | `#0C0C0B` | `#F2F0EB` | `#B0AEA6` | `#3A3A36` | `#84B8A4` | 8,8:1 |

Alasan tiap tema tambahan:

- **Putih**, untuk yang menganggap krem terlalu kuning. Latarnya putih murni, tetapi kartu tetap diberi satu tingkat kecerahan berbeda dan garis yang lebih gelap. Kartu putih di atas putih tanpa keduanya akan hilang sama sekali; versi pertama tema ini memang begitu dan hasilnya terbaca rata.
- **OLED**, untuk layar OLED: latar hitam benar supaya piksel mati total. Kartu tidak hitam murni (naik ke `#0C0C0B`) dan garisnya diangkat ke `#3A3A36`, sebab garis yang lebih gelap hilang saat layar diredupkan. Bilah peramban ponsel ikut hitam lewat `theme-color`.
- **Gelap** dipertahankan karena sebagian pengguna sudah memilihnya sebelum tema lain ada. Nilai lama `light` dan `dark` di penyimpanan dipetakan ke `kertas` dan `gelap`, jadi pilihan lama tidak hilang setelah pembaruan.

Catatan kontras, diukur bukan dikira. Teks normal lolos AA di keempat tema, terendah 6,4:1. Garis batas kartu berada di 1,4 sampai 1,8:1; itu disengaja karena garis di sini pemisah dekoratif, bukan satu-satunya penanda kontrol. Kolom isian dan tombol memakai `ink/55` dan `ink/25` sebagai batas, dengan batas isian di atas 3:1, sesuai ambang WCAG untuk batas kontrol.

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
