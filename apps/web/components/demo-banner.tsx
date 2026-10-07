"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveBranding } from "../lib/demo/branding";
import { useDemo } from "../lib/demo/context";
import { Button } from "./ui";

export function DemoBanner() {
  const t = useTranslations("Banner");
  const params = useSearchParams();
  const pathname = usePathname();
  const slug = pathname.startsWith("/p/") ? pathname.slice(3).split("/")[0] : undefined;
  const { state, actions } = useDemo();
  const branding = resolveBranding({
    slug,
    cabinet: params.get("cabinet"),
    doctor: params.get("doctor"),
    fallbackName: state.clinic.name,
    fallbackDoctor: state.clinic.doctorName,
  });

  return (
    <div className="border-b border-teal-900/30 bg-teal-950 text-white">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex min-w-0 items-center gap-2.5 text-sm">
          <span className="shrink-0 rounded-full bg-teal-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">
            {t("badge")}
          </span>
          <span className="truncate text-teal-50">
            {branding.personalized
              ? t("personalized", { doctor: branding.doctorName })
              : t("generic")}
          </span>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={slug ? `/p/${slug}` : "/reserver"}
            className="inline-flex rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-teal-950 shadow-sm hover:bg-teal-50"
          >
            {t("book")}
          </Link>
          <Button
            variant="inverse"
            className="px-3 py-1.5"
            onClick={() => {
              if (window.confirm(t("resetConfirm"))) actions.resetDemoStore();
            }}
          >
            {t("reset")}
          </Button>
        </div>
      </div>
    </div>
  );
}
