"use client";

import { CalendarDays, LayoutDashboard, Menu, Package, Stethoscope, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useDemo } from "../lib/demo/context";
import { BrandMark } from "./ui";

const LINKS = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/patients", key: "patients", icon: Users },
  { href: "/agenda", key: "agenda", icon: CalendarDays },
  { href: "/stock", key: "stock", icon: Package },
  { href: "/actes", key: "procedures", icon: Stethoscope },
] as const;

function isPublicPath(pathname: string): boolean {
  return pathname === "/reserver" || pathname.startsWith("/p/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const brand = useTranslations("Brand");
  const { ready, state } = useDemo();
  const [open, setOpen] = useState(false);

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-zinc-50" />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-zinc-200 bg-white md:flex">
          <div className="flex items-center gap-3 px-5 pb-4 pt-5">
            <BrandMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-zinc-950">
                {brand("name")}
              </p>
              <p className="truncate text-xs text-zinc-500">{brand("space")}</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3" aria-label={t("dashboard")}>
            {LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-teal-700 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-zinc-200 px-5 py-4">
            <p className="truncate text-sm font-medium text-zinc-950">{state.clinic.name}</p>
            <p className="truncate text-xs text-zinc-500">{state.clinic.doctorName}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandMark className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">{brand("name")}</p>
                <p className="truncate text-xs text-zinc-500">{state.clinic.name}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl p-2 text-zinc-700 hover:bg-zinc-100"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </header>
          {open ? (
            <nav className="flex flex-col gap-1 border-b border-zinc-200 bg-white p-3 md:hidden">
              {LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-teal-700 text-white" : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t(link.key)}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
