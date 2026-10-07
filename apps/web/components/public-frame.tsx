"use client";

import { BadgeCheck, Bell, CalendarCheck, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { BrandMark } from "./ui";

export function PublicFrame({
  name,
  doctorName,
  address,
  commune,
  specialties,
  children,
}: {
  name: string;
  doctorName: string;
  address: string;
  commune?: string;
  specialties: readonly string[];
  children: ReactNode;
}) {
  const t = useTranslations("Booking");
  const brand = useTranslations("Brand");
  const place = [address, commune].filter(Boolean).join(", ");

  return (
    <div className="min-h-[calc(100vh-3.25rem)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:px-6 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark />
            <p className="text-sm font-semibold tracking-tight text-zinc-950">{brand("name")}</p>
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{name}</h1>
          <p className="mt-2 text-lg text-zinc-700">{doctorName}</p>
          {place ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-zinc-600">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden />
              <span>{place}</span>
            </p>
          ) : null}
          {specialties.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {specialties.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="mt-8 space-y-3 text-sm text-zinc-700">
            <li className="flex items-start gap-3">
              <CalendarCheck className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden />
              {t("pointSchedule")}
            </li>
            <li className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden />
              {t("pointConfirm")}
            </li>
            <li className="flex items-start gap-3">
              <Bell className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden />
              {t("pointReminder")}
            </li>
          </ul>
        </div>
        <div className="lg:sticky lg:top-6">{children}</div>
      </div>
    </div>
  );
}
