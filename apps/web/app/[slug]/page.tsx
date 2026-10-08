import { notFound } from "next/navigation";
import DashboardPage from "../../components/dashboard-page";
import { clinicSlugFromPath } from "../../lib/demo/branding";

export default async function ShortClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!clinicSlugFromPath(`/${slug}`)) notFound();
  return <DashboardPage />;
}
