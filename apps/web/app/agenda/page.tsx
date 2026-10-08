"use client";

import { algiersIsoDay, appointmentStatusLabels, formatTime } from "@dentapulse/shared";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  Select,
  Sheet,
  StatusPill,
  TextInput,
} from "../../components/ui";
import { useDemo } from "../../lib/demo/context";
import { errorMessageKey } from "../../lib/demo/errors";
import type { AppointmentRecord } from "../../lib/demo/types";

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16] as const;

function appointmentTone(status: AppointmentRecord["status"]) {
  if (status === "confirmed" || status === "completed") return "ok" as const;
  if (status === "cancelled" || status === "no_show") return "bad" as const;
  return "warn" as const;
}

function parseIsoDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

function formatIsoDay(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDays(iso: string, days: number): string {
  const date = parseIsoDay(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoDay(date);
}

function weekStart(iso: string): string {
  const date = parseIsoDay(iso);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return formatIsoDay(date);
}

function hourInAlgiers(iso: string): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Algiers",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  return Number(hour);
}

export default function AgendaPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { ready, state, actions } = useDemo();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => algiersIsoDay(new Date()));
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) setView("week");
  }, []);

  const dayLabel = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-DZ" : "fr-DZ", {
      timeZone: "Africa/Algiers",
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return (iso: string) => format.format(parseIsoDay(iso));
  }, [locale]);

  const days = useMemo(() => {
    if (view === "day") return [cursor];
    const start = weekStart(cursor);
    return Array.from({ length: 7 }, (_, index) => shiftDays(start, index));
  }, [cursor, view]);

  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentRecord[]>();
    for (const row of state.appointments) {
      const key = algiersIsoDay(new Date(row.start));
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [state.appointments]);

  const selected = state.appointments.find((row) => row.id === selectedId) ?? null;

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-16">
      <PageHeader
        title={t("Agenda.title")}
        subtitle={t("Agenda.subtitle")}
        actions={<Button onClick={() => setOpen(true)}>{t("Agenda.add")}</Button>}
      />
      {message ? <Notice tone="ok">{message}</Notice> : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            aria-label={t("Agenda.previous")}
            onClick={() => setCursor((day) => shiftDays(day, view === "week" ? -7 : -1))}
          >
            ‹
          </Button>
          <Button variant="secondary" onClick={() => setCursor(algiersIsoDay(new Date()))}>
            {t("Agenda.today")}
          </Button>
          <Button
            variant="secondary"
            aria-label={t("Agenda.next")}
            onClick={() => setCursor((day) => shiftDays(day, view === "week" ? 7 : 1))}
          >
            ›
          </Button>
        </div>
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-0.5">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                view === mode ? "bg-teal-700 text-white" : "text-zinc-700"
              }`}
            >
              {t(`Agenda.${mode}`)}
            </button>
          ))}
        </div>
      </div>

      <Card className="max-w-full overflow-x-auto p-0">
        <div
          className="grid min-w-0"
          style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}
        >
          <div className="border-b border-zinc-200 bg-zinc-50" />
          {days.map((day) => {
            const closed = parseIsoDay(day).getUTCDay() === 5;
            return (
              <div
                key={day}
                className={`border-b border-s border-zinc-200 px-2 py-2 text-center text-xs font-medium ${
                  day === algiersIsoDay(new Date())
                    ? "bg-teal-50 text-teal-900"
                    : "bg-zinc-50 text-zinc-700"
                }`}
              >
                <p className="capitalize">{dayLabel(day)}</p>
                {closed ? <p className="text-[11px] text-zinc-500">{t("Agenda.closed")}</p> : null}
              </div>
            );
          })}
          {HOURS.map((hour) => (
            <HourRow
              key={hour}
              hour={hour}
              days={days}
              byDay={byDay}
              selectedId={selectedId}
              onSelect={setSelectedId}
              lookupPatient={(id) => actions.lookupPatient(id)?.fullName ?? "—"}
            />
          ))}
        </div>
      </Card>

      {selected ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-zinc-950">
                {actions.lookupPatient(selected.patientId)?.fullName}
              </p>
              <p className="text-sm text-zinc-500">
                {formatTime(new Date(selected.start))} ·{" "}
                {actions.lookupProcedure(selected.procedureId)?.name}
              </p>
            </div>
            <StatusPill
              label={appointmentStatusLabels[selected.status]}
              tone={appointmentTone(selected.status)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.status === "pending" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  actions.updateAppointment(selected.id, { status: "confirmed" });
                  setMessage(t("Agenda.updated"));
                }}
              >
                {t("Agenda.confirm")}
              </Button>
            ) : null}
            {selected.status === "confirmed" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  actions.updateAppointment(selected.id, { status: "completed" });
                  setMessage(t("Agenda.updated"));
                }}
              >
                {t("Agenda.complete")}
              </Button>
            ) : null}
            {selected.status !== "cancelled" ? (
              <Button
                variant="ghost"
                onClick={() => {
                  actions.updateAppointment(selected.id, { status: "cancelled" });
                  setMessage(t("Agenda.updated"));
                }}
              >
                {t("Agenda.cancelAppt")}
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Sheet
        open={open}
        title={t("Agenda.add")}
        onClose={() => setOpen(false)}
        closeLabel={t("Common.close")}
      >
        <AppointmentForm
          onDone={() => {
            setOpen(false);
            setMessage(t("Agenda.created"));
            setError(null);
          }}
          onError={(key) => setError(t(`Errors.${key}`))}
        />
      </Sheet>
    </div>
  );
}

function HourRow({
  hour,
  days,
  byDay,
  selectedId,
  onSelect,
  lookupPatient,
}: {
  hour: number;
  days: string[];
  byDay: Map<string, AppointmentRecord[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  lookupPatient: (id: string) => string;
}) {
  return (
    <>
      <div className="border-b border-zinc-100 px-1 py-2 text-end text-[11px] tabular-nums text-zinc-500">
        {String(hour).padStart(2, "0")}:00
      </div>
      {days.map((day) => {
        const items = (byDay.get(day) ?? []).filter((row) => hourInAlgiers(row.start) === hour);
        const closed = parseIsoDay(day).getUTCDay() === 5;
        return (
          <div
            key={`${day}-${hour}`}
            className={`min-h-14 border-b border-s border-zinc-100 p-1 ${closed ? "bg-zinc-50" : ""}`}
          >
            {items.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.id)}
                className={`mb-1 block w-full rounded-lg px-1.5 py-1 text-start text-[11px] leading-4 ${
                  selectedId === row.id
                    ? "bg-teal-700 text-white"
                    : row.status === "cancelled"
                      ? "bg-zinc-100 text-zinc-500 line-through"
                      : "bg-teal-50 text-teal-950"
                }`}
              >
                <span className="tabular-nums">{formatTime(new Date(row.start))}</span>{" "}
                {lookupPatient(row.patientId)}
              </button>
            ))}
          </div>
        );
      })}
    </>
  );
}

function AppointmentForm({
  onDone,
  onError,
}: {
  onDone: () => void;
  onError: (key: string) => void;
}) {
  const t = useTranslations();
  const { state, actions } = useDemo();
  const dentist = state.users.find((row) => row.role === "dentist");
  const [patientId, setPatientId] = useState(state.patients[0]?.id ?? "");
  const [procedureId, setProcedureId] = useState(state.procedures[0]?.id ?? "");
  const [startLocal, setStartLocal] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!dentist) {
          onError("dentistMissing");
          return;
        }
        const start = new Date(startLocal);
        const procedure = actions.lookupProcedure(procedureId);
        if (Number.isNaN(start.getTime()) || !procedure) {
          onError("validation");
          return;
        }
        const end = new Date(start.getTime() + procedure.durationMinutes * 60_000);
        try {
          actions.createAppointment({
            patientId,
            procedureId,
            dentistId: dentist.id,
            start: start.toISOString(),
            end: end.toISOString(),
          });
          onDone();
        } catch (caught) {
          onError(errorMessageKey(caught));
        }
      }}
    >
      <Field label={t("Agenda.patient")}>
        <Select value={patientId} onChange={(event) => setPatientId(event.target.value)}>
          {state.patients.map((row) => (
            <option key={row.id} value={row.id}>
              {row.fullName}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Agenda.procedure")}>
        <Select value={procedureId} onChange={(event) => setProcedureId(event.target.value)}>
          {state.procedures.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Agenda.start")}>
        <TextInput
          type="datetime-local"
          value={startLocal}
          onChange={(event) => setStartLocal(event.target.value)}
          required
        />
      </Field>
      <Button type="submit">{t("Common.create")}</Button>
    </form>
  );
}
