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
}) {
  const { paket } = await params;
  const data = PAKET_BY_ID[paket];
  return { title: data ? data.name : "Tryout" };
}

export default async function Page({ params }: { params: Promise<{ paket: string }> }) {
  const { paket } = await params;
  const data = PAKET_BY_ID[paket];
  if (!data) notFound();
  return <TryoutRunner paket={data} />;
}
