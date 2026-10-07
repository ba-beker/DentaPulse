"use client";

import { Search } from "lucide-react";
import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type Tone = "ok" | "warn" | "bad" | "neutral";

const toneClass: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
  neutral: "bg-zinc-100 text-zinc-700",
};

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none">
        <path
          d="M12 3.2c2 0 3.4 1.1 4 2.6.6 1.5.6 3.2.3 4.8-.3 1.4-.1 2.7.5 3.8.7 1.2 1 2.2.6 3.2-.6 1.4-2 2-3.3 1.6-.9-.3-1.4-1.1-1.6-2-.2-.5-.4-.7-.5-.7s-.3.2-.5.7c-.2.9-.7 1.7-1.6 2-1.3.4-2.7-.2-3.3-1.6-.4-1-.1-2 .6-3.2.6-1.1.8-2.4.5-3.8-.3-1.6-.3-3.3.3-4.8.6-1.5 2-2.6 4-2.6Z"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7.2 12h2.1l1.15-2.1 1.7 3.5 1.15-1.4H16.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-500">{label}</p>
        {icon ? (
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">
        {value}
      </p>
    </Card>
  );
}

export function Notice({ tone, children }: { tone: "ok" | "bad"; children: ReactNode }) {
  const styles = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    bad: "border-rose-200 bg-rose-50 text-rose-800",
  } as const;
  return (
    <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </p>
  );
}

export const tableHeadClass =
  "border-b border-zinc-200 bg-zinc-50/90 text-xs uppercase tracking-wide text-zinc-500";
export const thClass = "px-4 py-3 text-start font-medium";
export const tdClass = "px-4 py-3.5 align-middle";
export const trClass =
  "border-b border-zinc-100 transition-colors last:border-0 hover:bg-teal-50/40";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "inverse" | "danger";
}) {
  const styles = {
    primary: "bg-teal-700 text-white shadow-sm hover:bg-teal-800",
    secondary: "border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50",
    ghost: "text-zinc-700 hover:bg-zinc-100",
    inverse: "text-teal-50 hover:bg-white/10",
    danger: "bg-rose-700 text-white shadow-sm hover:bg-rose-800",
  } as const;

  return (
    <button
      type={props.type ?? "button"}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-800">{label}</span>
      {children}
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 ${props.className ?? ""}`}
    />
  );
}

export function Select({
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm ${className}`}
    >
      {children}
    </select>
  );
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative max-w-md">
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <TextInput {...props} className={`ps-9 ${props.className ?? ""}`} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  closeLabel,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/40"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full w-full flex-col border-s border-zinc-200 bg-white shadow-2xl ${wide ? "max-w-2xl" : "max-w-md"}`}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            {closeLabel}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}
