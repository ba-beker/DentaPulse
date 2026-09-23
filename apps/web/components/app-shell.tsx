"use client";

import { CalendarDays, LayoutDashboard, Menu, Package, Stethoscope, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useDemo } from "../lib/demo/context";

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
  const { ready, state } = useDemo();
  const [open, setOpen] = useState(false);

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-zinc-50" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-e border-zinc-200 bg-white p-4 md:block">
          <p className="px-2 text-sm font-semibold text-teal-700">{state.clinic.name}</p>
          <p className="mb-6 px-2 text-xs text-zinc-500">{state.clinic.doctorName}</p>
          <nav className="flex flex-col gap-1" aria-label={t("dashboard")}>
            {LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-teal-700 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
            <p className="text-sm font-semibold text-teal-700">{state.clinic.name}</p>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-700"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </header>
          {open ? (
            <nav className="flex flex-col gap-1 border-b border-zinc-200 bg-white p-3 md:hidden">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
