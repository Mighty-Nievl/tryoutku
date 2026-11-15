export const metadata = {
  title: "Glosarium",
  description: "Arti istilah yang muncul di TryOutku: estimasi nilai, tingkat soal, subtes, mastery, streak, dan XP.",
};

const ISTILAH: { term: string; arti: string }[] = [
  {
    term: "Subtes",
    arti:
      "Bagian ujian. Pada UTBK SNBT ada tujuh subtes: Penalaran Umum, Pengetahuan dan Pemahaman Umum, Pemahaman Bacaan dan Menulis, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, dan Penalaran Matematika.",
  },
  {
    term: "Mapel",
    arti:
      "Mata pelajaran untuk ujian sekolah, misalnya Matematika, Fisika, Ekonomi, atau Sejarah.",
  },
  {
    term: "Paket tryout",
    arti:
      "Satu set soal dengan komposisi subtes tertentu dan durasi tertentu. Soalnya diambil acak dari bank, jadi dua percobaan pada paket yang sama bisa memberi soal berbeda.",
  },
  {
    term: "Skor",
    arti:
      "Persentase jawaban benar dari seluruh soal pada sesi itu. Skor 70 berarti 70% soal dijawab benar.",
  },
  {
    term: "Estimasi nilai",
    arti:
      "Angka 200 sampai 800 yang dipakai sebagai gambaran kasar, dihitung linear dari persentase benar. Ini bukan skor IRT resmi UTBK. Gunanya hanya membandingkan sesimu sendiri dari waktu ke waktu.",
  },
  {
    term: "Tingkat soal",
    arti:
      "Penanda kesulitan yang kami tetapkan saat menulis soal: 1 mudah, 2 sedang, 3 sulit. Bukan penilaian resmi dan tidak memengaruhi skor.",
  },
  {
    term: "Ragu",
    arti:
      "Tanda pribadi pada soal yang ingin kamu tinjau lagi. Tidak memengaruhi penilaian, hanya membantu saat mengecek sebelum mengumpulkan.",
  },
  {
    term: "Mastery",
    arti:
      "Tingkat penguasaan satu subtes berdasarkan riwayat latihanmu: makin tinggi akurasi, makin tinggi tingkatnya. Skala 1 sampai 5.",
  },
  {
    term: "XP",
    arti:
      "Poin pengalaman dari jawaban benar: 10 per benar di tryout, 5 di latihan, 12 di tantangan harian, ditambah bonus bila skormu tinggi.",
  },
  {
    term: "Level",
    arti:
      "Tingkatan dari akumulasi XP, mulai Pemula sampai Jagoan. Level tidak pernah turun.",
  },
  {
    term: "Streak",
    arti:
      "Jumlah hari berturut-turut kamu menyelesaikan minimal satu sesi. Terlewat satu hari, hitungan mulai dari satu lagi.",
  },
  {
    term: "Lencana",
    arti:
      "Penanda pencapaian yang syaratnya jelas, misalnya menembus skor 85% atau menyelesaikan tiga paket tryout. Semua syarat dihitung dari riwayat, bukan diberikan otomatis.",
  },
  {
    term: "Tersinkron",
    arti:
      "Hasil berhasil dikirim ke server, sehingga bisa muncul di papan skor. Kalau tidak tersinkron, hasil tetap tersimpan di perangkat.",
  },
];

export default function GlosariumPage() {
  return (
    <div className="max-w-3xl space-y-6 py-4">
      <header>
        <p className="label">Glosarium</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Arti istilah di TryOutku</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Semua istilah yang muncul di halaman hasil, profil, dan papan skor, dijelaskan dengan bahasa
          sehari-hari.
        </p>
      </header>

      <dl className="border-t border-line">
        {ISTILAH.map((item) => (
          <div key={item.term} className="border-b border-line py-4">
            <dt className="font-semibold">{item.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{item.arti}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
