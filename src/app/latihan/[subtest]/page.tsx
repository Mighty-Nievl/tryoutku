import { notFound } from "next/navigation";
import { SUBTESTS, SUBTEST_BY_ID } from "@/lib/subtests";
import PracticeRunner from "@/components/PracticeRunner";

export function generateStaticParams() {
  return SUBTESTS.map((subtest) => ({ subtest: subtest.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subtest: string }>;
}) {
  const { subtest } = await params;
  const data = SUBTEST_BY_ID[subtest];
  return { title: data ? `Latihan ${data.name}` : "Latihan" };
}

export default async function Page({ params }: { params: Promise<{ subtest: string }> }) {
  const { subtest } = await params;
  const data = SUBTEST_BY_ID[subtest];
  if (!data) notFound();
  return <PracticeRunner subtest={data} />;
}
