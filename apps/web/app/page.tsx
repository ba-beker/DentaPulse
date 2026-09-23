"use client";

import {
  appointmentStatusLabels,
  formatDA,
  formatDate,
  formatTime,
  stockStatusLabels,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";
import { Card, StatusPill } from "../components/ui";
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">{t("patients")}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{state.patients.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">{t("todayAppointments")}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{upcoming.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">{t("revenue")}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{formatDA(paid)}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">{t("outstanding")}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {formatDA(Math.max(0, billed - paid))}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{t("upcoming")}</h2>
            <Link href="/agenda" className="text-sm text-teal-700">
              {t("openApp")}
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("noUpcoming")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcoming.map((row) => {
                const patient = actions.lookupPatient(row.patientId);
                const procedure = actions.lookupProcedure(row.procedureId);
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{patient?.fullName ?? "—"}</p>
                      <p className="text-zinc-500">{procedure?.name}</p>
                    </div>
                    <div className="text-end">
                      <p className="tabular-nums">
                        {formatDate(new Date(row.start))} {formatTime(new Date(row.start))}
                      </p>
                      <StatusPill
                        label={appointmentStatusLabels[row.status]}
                        tone={row.status === "confirmed" ? "ok" : "warn"}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{t("alerts")}</h2>
            <Link href="/stock" className="text-sm text-teal-700">
              {t("openApp")}
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("noAlerts")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {alerts.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="tabular-nums text-zinc-500">
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
