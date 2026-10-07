"use client";

import {
  appointmentStatusLabels,
  formatDA,
  formatDate,
  formatTime,
  stockStatusLabels,
} from "@dentapulse/shared";
import { Banknote, CalendarDays, Package, Users, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";
import { Card, PageHeader, StatCard, StatusPill } from "../components/ui";
import { useDemo } from "../lib/demo/context";

function stockTone(status: string): "ok" | "warn" | "bad" {
  if (status === "out" || status === "expired") return "bad";
  return "warn";
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { ready, state, actions } = useDemo();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...state.appointments]
      .filter((row) => row.status !== "cancelled" && new Date(row.end).getTime() >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 6);
  }, [state.appointments]);

  const alerts = useMemo(() => actions.inventoryAlerts().slice(0, 6), [actions, state.consumables]);
  const paid = state.payments.reduce((sum, row) => sum + row.amount, 0);
  const billed = state.treatmentPlans.reduce((sum, row) => sum + row.total, 0);

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${t("eyebrow")} · ${formatDate(new Date())}`}
        title={state.clinic.name}
        subtitle={`${state.clinic.doctorName} — ${t("subtitle")}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("patients")}
          value={String(state.patients.length)}
          icon={<Users className="size-4" aria-hidden />}
        />
        <StatCard
          label={t("todayAppointments")}
          value={String(upcoming.length)}
          icon={<CalendarDays className="size-4" aria-hidden />}
        />
        <StatCard
          label={t("revenue")}
          value={formatDA(paid)}
          icon={<Banknote className="size-4" aria-hidden />}
        />
        <StatCard
          label={t("outstanding")}
          value={formatDA(Math.max(0, billed - paid))}
          icon={<Wallet className="size-4" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-zinc-950">{t("upcoming")}</h2>
            <Link href="/agenda" className="text-sm font-medium text-teal-800 hover:text-teal-950">
              {t("openApp")}
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">{t("noUpcoming")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcoming.map((row) => {
                const patient = actions.lookupPatient(row.patientId);
                const procedure = actions.lookupProcedure(row.procedureId);
                return (
                  <li key={row.id} className="flex items-center gap-3 py-3 text-sm">
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-zinc-50 px-2 py-1.5 text-center">
                      <span className="text-[11px] text-zinc-500">
                        {formatDate(new Date(row.start)).slice(0, 5)}
                      </span>
                      <span className="font-semibold text-zinc-950 tabular-nums">
                        {formatTime(new Date(row.start))}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-950">
                        {patient?.fullName ?? "—"}
                      </p>
                      <p className="truncate text-zinc-500">{procedure?.name}</p>
                    </div>
                    <StatusPill
                      label={appointmentStatusLabels[row.status]}
                      tone={row.status === "confirmed" ? "ok" : "warn"}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-950">
              <Package className="size-4 text-teal-700" aria-hidden />
              {t("alerts")}
            </h2>
            <Link href="/stock" className="text-sm font-medium text-teal-800 hover:text-teal-950">
              {t("openApp")}
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">{t("noAlerts")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {alerts.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950">{row.name}</p>
                    <p className="text-zinc-500 tabular-nums">
                      {row.currentStock} {row.unit}
                    </p>
                  </div>
                  <StatusPill label={stockStatusLabels[row.status]} tone={stockTone(row.status)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
