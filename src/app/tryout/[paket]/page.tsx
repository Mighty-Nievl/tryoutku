import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAKETS, PAKET_BY_ID } from "@/lib/pakets";
import TryoutRunner from "@/components/TryoutRunner";

export function generateStaticParams() {
  return PAKETS.map((paket) => ({ paket: paket.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ paket: string }>;
}): Promise<Metadata> {
  const { paket } = await params;
  const data = PAKET_BY_ID[paket];
  if (!data) return { title: "Tryout" };

  const jumlahSoal = Object.values(data.blueprint).reduce((a, b) => a + b, 0);
  const deskripsi = `${jumlahSoal} soal, ${data.durationMin} menit, timer bisa diubah. ${data.description}`;

  return {
    title: data.name,
    description: deskripsi,
    alternates: { canonical: `/tryout/${data.id}/` },
    openGraph: {
      type: "article",
      url: `/tryout/${data.id}/`,
      title: `${data.name} - ${jumlahSoal} soal, ${data.durationMin} menit`,
      description: deskripsi,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: data.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} - ${jumlahSoal} soal, ${data.durationMin} menit`,
      description: deskripsi,
      images: ["/og.png"],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ paket: string }> }) {
  const { paket } = await params;
  const data = PAKET_BY_ID[paket];
  if (!data) notFound();
  return <TryoutRunner paket={data} />;
}
