"use client";

import { appointmentStatusLabels, formatDate, formatTime } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button, Card, Field, Select, Sheet, StatusPill, TextInput } from "../../components/ui";
import { useDemo } from "../../lib/demo/context";
import { errorMessageKey } from "../../lib/demo/errors";
import type { AppointmentRecord } from "../../lib/demo/types";

function appointmentTone(status: AppointmentRecord["status"]) {
  if (status === "confirmed" || status === "completed") return "ok" as const;
  if (status === "cancelled" || status === "no_show") return "bad" as const;
  return "warn" as const;
}

export default function AgendaPage() {
  const t = useTranslations();
  const { ready, state, actions } = useDemo();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () => [...state.appointments].sort((a, b) => a.start.localeCompare(b.start)),
    [state.appointments],
  );

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Agenda.title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("Agenda.subtitle")}</p>
        </div>
        <Button onClick={() => setOpen(true)}>{t("Agenda.add")}</Button>
      </header>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("Common.date")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Agenda.patient")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Agenda.procedure")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Common.status")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-zinc-500" colSpan={5}>
                  {t("Agenda.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const patient = actions.lookupPatient(row.patientId);
                const procedure = actions.lookupProcedure(row.procedureId);
                return (
                  <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 tabular-nums">
                      {formatDate(new Date(row.start))} {formatTime(new Date(row.start))}
                    </td>
                    <td className="px-4 py-3">{patient?.fullName}</td>
                    <td className="px-4 py-3">{procedure?.name}</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        label={appointmentStatusLabels[row.status]}
                        tone={appointmentTone(row.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.status === "pending" ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              actions.updateAppointment(row.id, { status: "confirmed" });
                              setMessage(t("Agenda.updated"));
                            }}
                          >
                            {t("Agenda.confirm")}
                          </Button>
                        ) : null}
                        {row.status === "confirmed" ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              actions.updateAppointment(row.id, { status: "completed" });
                              setMessage(t("Agenda.updated"));
                            }}
                          >
                            {t("Agenda.complete")}
                          </Button>
                        ) : null}
                        {row.status !== "cancelled" ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              actions.updateAppointment(row.id, { status: "cancelled" });
                              setMessage(t("Agenda.updated"));
                            }}
                          >
                            {t("Agenda.cancelAppt")}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

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
