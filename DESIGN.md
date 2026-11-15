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

## Gerak yang mengikuti gulir

- **Kepala sesi melebar saat menempel.** Di dalam alur halaman bentuknya kartu beradius 6px selebar kolom isi. Begitu menempel di bawah TopBar, kartu itu melebar sampai tepi layar, sudutnya jadi siku, dan garis batasnya hanya tersisa di atas dan bawah. Tujuannya: saat halaman digulir, batas antara kepala sesi dan soal tidak lagi terlihat seperti dua kartu bertumpuk, tapi satu bilah yang memang menempel.
- Yang dianimasikan adalah lapisan latar di belakang isi, lewat `transform: scaleX()` dan `opacity`. Lebar kartu tidak pernah berubah (tetap selebar kolom isi), jadi tidak ada perhitungan tata letak per frame. Versi pertama menganimasikan `width` dan `margin`, hasilnya patah karena setiap frame memicu reflow.
- Lebar lapisan diukur dari `clientWidth` elemen, bukan `100vw`, karena `100vw` memasukkan lebar scrollbar dan membuat bilah melewati tepi kanan sekitar 15px di desktop. Geometri lapisan sudah ditetapkan sejak sebelum menempel, jadi tidak ada lompatan saat transisi mulai.
- Isi bilah tetap disejajarkan dengan kartu soal di bawahnya: pembungkus dalam memakai `max-width: 69rem` dan padding yang sama dengan kolom isi. Diukur di 390, 1024, dan 1280, selisih tepi kiri isi bilah dengan kartu soal nol piksel.
- Penandanya elemen setinggi 1px di atas kartu, dibaca lewat posisi pada gulir, bukan angka gulir. Ambang 64px sama dengan tinggi TopBar.
- Transisinya 200ms dan dimatikan otomatis oleh `prefers-reduced-motion` bersama animasi lain.

## Elemen visual, bukan hiasan

Halaman tidak boleh hanya bergantung pada teks. Aturannya: elemen visual harus berasal dari data atau dari produknya sendiri, bukan ilustrasi dekoratif.

- **Pratinjau soal di beranda** menampilkan tiga soal sungguhan lintas subtes (PU, PK, PPU) beserta opsi A sampai D. Kunci dan pembahasan baru terbuka setelah pengunjung memilih — yang menjual produk adalah momen memilih, bukan jawaban yang disuapkan. Setelah terjawab, pengunjung bisa melanjut ke soal berikutnya tanpa muat ulang, dan umpan baliknya diumumkan lewat `aria-live` untuk pembaca layar.
- **Strip angka di kaki pratinjau** memuat jumlah soal, durasi, dan ada tidaknya pembahasan. Angka memakai serif, label memakai sans, dan nilai non-angka tidak ikut diserifkan.
- **Titik progres** dipakai di mode latihan menggantikan kalimat "soal 3 dari 12". Di atas 24 soal titik terlalu rapat, jadi diganti bilah proporsional.
- **Cincin skor** di halaman hasil menggantikan angka besar. Nilai 0 ditampilkan sebagai cincin kosong, bukan busur palsu, karena angka yang dibulatkan ke atas akan berbohong.
- **Ikon garis** untuk jam, centang, keluar, panah, dan pensil. Tidak ada emoji sebagai ikon.

## Tipografi

- **Judul**: IBM Plex Serif 600/700. Alasan: keluarga Plex dirancang untuk keterbacaan dokumen, dan serif memisahkan judul dari data.
- **Isi**: IBM Plex Sans 400/500/600. Alasan: tabel dan angka kecil butuh sans yang netral; Plex Sans punya angka tabular.
- **Angka waktu dan soal**: IBM Plex Mono dengan `font-variant-numeric: tabular-nums` supaya timer tidak menggeser lebar setiap detik.

## Bentuk dan gerak

- Radius 6px untuk kartu dan tombol, 4px untuk sel navigasi. Pil hanya untuk label status yang memang berbentuk label.
- Tanpa gradien, tanpa `backdrop-blur` di navbar dan kartu, tanpa glow. Gerak hanya dua jenis: kemunculan hasil dan transisi soal (menandai konten baru), serta kemunculan section saat digulir — naik 10px dan fade selama 420ms, sekali jalan, hanya untuk konten yang mulanya di bawah lipatan. Elemen yang sudah terlihat saat load tampil langsung tanpa animasi, supaya tidak ada kedip; `prefers-reduced-motion` mematikan semuanya, dan tanpa `IntersectionObserver` kelas animasi tidak dipasang sama sekali sehingga isi halaman tidak pernah terjebak transparan.
- **Eyebrow bernomor**: tiap section diawali nomor mono (`01`–`04`), judul section, lalu garis rambut yang memanjang ke tepi. Ini penanda struktur ala daftar isi lembar ujian, bukan hiasan; angka mononya mengikuti font nomor yang dipakai di seluruh halaman.
- **Pita "Bentuk hasil"** memakai latar `raised` selebar kolom isi dengan garis atas-bawah, memecah ritme halaman yang seluruhnya bergaris rambut. Satu perubahan latar per halaman — lebih dari itu dan halaman kehilangan ketenangan kertasnya.
- Fokus keyboard selalu terlihat: outline 2px warna aksen dengan offset 2px.

## Yang sengaja tidak dipakai

- Gradien ungu-biru dan teks bergradien.
- Badge pil di atas judul, titik status dekoratif, emoji sebagai ikon.
- Bagian "tiga langkah" dengan ikon bulat seragam.
- Statistik karangan. Angka yang tampil (jumlah soal, jumlah subtes, jumlah paket) dihitung dari bank soal saat build.

## Status dokumen

Arah ini disusun tanpa arahan brand dari pemilik produk, karena belum ada. Anggap sebagai usulan yang bisa diganti; begitu ada arahan resmi (warna, font, nada), dokumen ini yang pertama diperbarui.
