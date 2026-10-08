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
import { useMemo, useState } from "react";
import { useDisplayedClinic } from "./branding-bridge";
import { PricingSection } from "./offer-bar";
import { QuantityText } from "./quantity";
import { ReminderPanel } from "./reminder-panel";
import { Button, Card, PageHeader, Sheet, StatCard, StatusPill } from "./ui";
import { useDemo } from "../lib/demo/context";

const DAY = 86_400_000;

function stockTone(status: string): "ok" | "warn" | "bad" {
  if (status === "out" || status === "expired") return "bad";
  return "warn";
}

function chaseCopy(locale: string, name: string, amount: string, clinic: string): string {
  if (locale.startsWith("ar")) {
    return `مرحبا ${name}، تبقّى ${amount} للدفع في ${clinic}. يمكنكم التسوية في العيادة (نقداً أو CCP). شكراً.`;
  }
  return `Bonjour ${name}, il reste ${amount} à régler chez ${clinic}. Vous pouvez passer au cabinet (espèces ou CCP). Merci.`;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const clinic = useDisplayedClinic();
  const { ready, state, actions } = useDemo();
  const [chased, setChased] = useState<string | null>(null);
  const [chaseId, setChaseId] = useState<string | null>(null);

  const upcomingAll = useMemo(() => {
    const now = Date.now();
    return [...state.appointments]
      .filter((row) => row.status !== "cancelled" && new Date(row.end).getTime() >= now)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [state.appointments]);

  const alerts = useMemo(() => actions.inventoryAlerts().slice(0, 6), [actions, state.consumables]);
  const paid = state.payments.reduce((sum, row) => sum + row.amount, 0);
  const billed = state.treatmentPlans.reduce((sum, row) => sum + row.total, 0);
  const outstanding = Math.max(0, billed - paid);

  const debtors = useMemo(() => {
    return state.patients
      .map((patient) => ({
        patient,
        outstanding: actions.patientFinancials(patient.id).outstanding,
      }))
      .filter((row) => row.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [actions, state.patients, state.payments, state.treatmentPlans]);

  const recalls = useMemo(() => {
    const now = Date.now();
    const future = new Set(
      state.appointments
        .filter((row) => row.status !== "cancelled" && new Date(row.end).getTime() >= now)
        .map((row) => row.patientId),
    );
    const lastVisit = new Map<string, number>();
    for (const record of state.clinicalRecords) {
      const at = new Date(record.performedAt).getTime();
      lastVisit.set(record.patientId, Math.max(lastVisit.get(record.patientId) ?? 0, at));
    }
    const abandoned = new Set(
      state.treatmentPlans
        .filter((plan) => {
          const open = plan.items.some(
            (item) => item.status === "planned" || item.status === "in_progress",
          );
          const age = now - new Date(plan.createdAt).getTime();
          return open && age > 60 * DAY && !future.has(plan.patientId);
        })
        .map((plan) => plan.patientId),
    );
    const rows: Array<{ id: string; name: string; kind: "abandoned" | "checkup" }> = [];
    for (const patient of state.patients) {
      if (future.has(patient.id)) continue;
      if (abandoned.has(patient.id)) {
        rows.push({ id: patient.id, name: patient.fullName, kind: "abandoned" });
        continue;
      }
      const last = lastVisit.get(patient.id);
      if (last !== undefined && now - last > 150 * DAY) {
        rows.push({ id: patient.id, name: patient.fullName, kind: "checkup" });
      }
    }
    return rows;
  }, [state.appointments, state.clinicalRecords, state.patients, state.treatmentPlans]);

  const chasePatient = debtors.find((row) => row.patient.id === chaseId) ?? null;

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <PageHeader
        eyebrow={`${t("eyebrow")} · ${formatDate(new Date())}`}
        title={clinic.name}
        subtitle={clinic.doctorName ? `${clinic.doctorName} — ${t("subtitle")}` : t("subtitle")}
      />

      <Card className="border-teal-200 bg-teal-50/60">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-teal-900">{t("outstanding")}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums sm:text-4xl">
              {formatDA(outstanding)}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-700">{t("outstandingHint")}</p>
          </div>
          <Wallet className="size-8 text-teal-700" aria-hidden />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("patients")}
          value={String(state.patients.length)}
          icon={<Users className="size-4" aria-hidden />}
        />
        <StatCard
          label={t("todayAppointments")}
          value={String(upcomingAll.length)}
          icon={<CalendarDays className="size-4" aria-hidden />}
        />
        <StatCard
          label={t("revenue")}
          value={formatDA(paid)}
          icon={<Banknote className="size-4" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-zinc-950">{t("owes")}</h2>
          {debtors.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">{t("noOwes")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100">
              {debtors.map((row) => (
                <li key={row.patient.id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-950">{row.patient.fullName}</p>
                    <p className="tabular-nums text-zinc-500">{formatDA(row.outstanding)}</p>
                  </div>
                  <Button
                    variant={chased === row.patient.id ? "secondary" : "primary"}
                    className="px-3 py-1.5"
                    onClick={() => setChaseId(row.patient.id)}
                  >
                    {chased === row.patient.id ? t("chased") : t("chase")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-zinc-950">{t("recall")}</h2>
          {recalls.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">{t("noRecall")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100">
              {recalls.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link
                    href={`/patients/${row.id}`}
                    className="min-w-0 truncate font-medium text-zinc-950"
                  >
                    {row.name}
                  </Link>
                  <StatusPill
                    label={row.kind === "abandoned" ? t("abandoned") : t("checkupDue")}
                    tone={row.kind === "abandoned" ? "bad" : "warn"}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ReminderPanel />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-zinc-950">{t("upcoming")}</h2>
            <Link href="/agenda" className="text-sm font-medium text-teal-800 hover:text-teal-950">
              {t("openApp")}
            </Link>
          </div>
          {upcomingAll.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">{t("noUpcoming")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcomingAll.slice(0, 6).map((row) => {
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
                    <p className="text-zinc-500">
                      <QuantityText count={row.currentStock} unit={row.unit} />
                    </p>
                  </div>
                  <StatusPill label={stockStatusLabels[row.status]} tone={stockTone(row.status)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PricingSection />

      <Sheet
        open={chasePatient !== null}
        title={t("chaseTitle")}
        onClose={() => setChaseId(null)}
        closeLabel={common("close")}
      >
        {chasePatient ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-[#e7f7ef] px-4 py-3 text-sm leading-6" dir="ltr">
              {chaseCopy(
                "fr",
                chasePatient.patient.fullName,
                formatDA(chasePatient.outstanding),
                clinic.name,
              )}
            </div>
            <div
              className="rounded-2xl bg-[#e7f7ef] px-4 py-3 font-[family-name:var(--font-arabic)] text-sm leading-6"
              dir="rtl"
            >
              {chaseCopy(
                "ar",
                chasePatient.patient.fullName,
                formatDA(chasePatient.outstanding),
                clinic.name,
              )}
            </div>
            <Button
              onClick={() => {
                setChased(chasePatient.patient.id);
                setChaseId(null);
              }}
            >
              {t("chase")}
            </Button>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
