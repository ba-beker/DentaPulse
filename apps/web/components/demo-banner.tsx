"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
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
    <div className="border-b border-teal-800/10 bg-teal-700 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 shrink-0" aria-hidden />
          <span>
            {branding.personalized
              ? t("personalized", { doctor: branding.doctorName })
              : t("generic")}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={slug ? `/p/${slug}` : "/reserver"}
            className="inline-flex rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-teal-800"
          >
            {t("book")}
          </Link>
          <Button
            variant="ghost"
            className="text-white hover:bg-teal-600"
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
