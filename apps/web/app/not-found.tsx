import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-950">{t("title")}</h1>
      <p className="text-sm leading-6 text-zinc-600">{t("body")}</p>
      <Link href="/" className="text-sm font-medium text-teal-800 hover:text-teal-950">
        {t("home")}
      </Link>
    </div>
  );
}
