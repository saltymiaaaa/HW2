import { notFound } from "next/navigation";
import { seedServices } from "@/lib/seed";
import ServiceView from "@/components/service-view";

/** Static export needs the ids ahead of time; the portfolio is the seed set. */
export function generateStaticParams() {
  return seedServices().map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const service = seedServices().find((s) => s.id === id);
    return { title: service ? `${service.name} — Exit Check` : "Exit Check" };
  });
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!seedServices().some((s) => s.id === id)) notFound();
  return <ServiceView id={id} />;
}
