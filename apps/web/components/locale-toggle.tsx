"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LocaleToggle({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const locale = useLocale();
  const router = useRouter();

  function choose(next: "fr" | "ar") {
    if (next === locale) return;
    document.cookie = `dp-locale=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    router.refresh();
  }

  const shell = tone === "light" ? "border-zinc-200 bg-zinc-50" : "border-white/15 bg-white/10";
  const idle = tone === "light" ? "text-zinc-600 hover:bg-white" : "text-teal-50 hover:bg-white/10";
  const active = tone === "light" ? "bg-white text-teal-900 shadow-sm" : "bg-white text-teal-950";

  return (
    <div
      className={`inline-flex rounded-xl border p-0.5 text-xs font-semibold ${shell} ${className}`}
      role="group"
      aria-label="Language"
    >
      {(
        [
          ["fr", "FR"],
          ["ar", "ع"],
        ] as const
      ).map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          className={`rounded-lg px-2 py-1 ${locale === code ? active : idle}`}
          aria-pressed={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
