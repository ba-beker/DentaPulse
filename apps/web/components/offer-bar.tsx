"use client";

import { useTranslations } from "next-intl";
import { useDisplayedClinic } from "./branding-bridge";

export function salesWhatsAppLink(text: string): string {
  const phone = (process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "").replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export function OfferBar() {
  const t = useTranslations("Offer");
  const clinic = useDisplayedClinic();
  const href = salesWhatsAppLink(t("whatsappText", { clinic: clinic.name }));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-pretty text-zinc-700">{t("sticky")}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#128C7E] px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0e6e63]"
        >
          {t("activate")}
        </a>
      </div>
    </div>
  );
}

export function PricingSection() {
  const t = useTranslations("Offer");
  const clinic = useDisplayedClinic();
  const href = salesWhatsAppLink(t("whatsappText", { clinic: clinic.name }));

  return (
    <section id="tarifs" className="scroll-mt-24">
      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-950">{t("title")}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-700">{t("subtitle")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <p className="rounded-xl bg-white px-4 py-3 text-lg font-semibold text-zinc-950">
            {t("month")}
          </p>
          <div className="rounded-xl bg-white px-4 py-3">
            <p className="text-lg font-semibold text-zinc-950">{t("year")}</p>
            <p className="mt-1 text-sm text-zinc-600">{t("yearHint")}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
          <li>{t("pilot")}</li>
          <li>{t("pay")}</li>
          <li>{t("report")}</li>
          <li>{t("data")}</li>
        </ul>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-xl bg-[#128C7E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0e6e63]"
        >
          {t("activate")}
        </a>
      </div>
    </section>
  );
}
