"use client";

import {
  algiersIsoDay,
  formatDA,
  formatDate,
  formatTime,
  renderReminderMessage,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDemo } from "../lib/demo/context";
import { errorMessageKey } from "../lib/demo/errors";
import { Button, Card, Field, Select, TextInput } from "./ui";

export function BookingWizard({
  clinicName,
  doctorName,
  address,
}: {
  clinicName: string;
  doctorName: string;
  address: string;
}) {
  const t = useTranslations();
  const { ready, state, actions } = useDemo();
  const dentist = state.users.find((row) => row.role === "dentist");
  const [step, setStep] = useState(1);
  const [procedureId, setProcedureId] = useState(state.procedures[0]?.id ?? "");
  const [day, setDay] = useState(algiersIsoDay(new Date()));
  const [slotStart, setSlotStart] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const slots = useMemo(() => {
    if (!procedureId || !ready) return [];
    try {
      return actions.listAvailability(procedureId, day);
    } catch {
      return [];
    }
  }, [actions, day, procedureId, ready, state.appointments]);

  if (!ready) return <div className="min-h-96" />;

  if (done) {
    const reminder = renderReminderMessage("whatsapp", "24h", {
      clinicName,
      doctorName,
      patientName: fullName,
      date: formatDate(new Date(slotStart)),
      time: formatTime(new Date(slotStart)),
      address,
    });
    return (
      <Card className="mx-auto max-w-xl">
        <p className="text-sm font-medium text-emerald-700">{t("Booking.success")}</p>
        <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-medium">{t("Booking.reminder")}</p>
          <p className="mt-2">{reminder}</p>
        </div>
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-teal-700">
          {t("Booking.openCabinet")}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      {error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">{t("Booking.stepProcedure")}</h2>
          <Field label={t("Agenda.procedure")}>
            <Select value={procedureId} onChange={(event) => setProcedureId(event.target.value)}>
              {state.procedures
                .filter((row) => row.isActive)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                    {state.clinic.publicShowPrices ? ` — ${formatDA(row.basePrice)}` : ""}
                  </option>
                ))}
            </Select>
          </Field>
          <Button onClick={() => setStep(2)}>{t("Booking.next")}</Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">{t("Booking.stepSlot")}</h2>
          <Field label={t("Booking.day")}>
            <TextInput type="date" value={day} onChange={(event) => setDay(event.target.value)} />
          </Field>
          {slots.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("Booking.noSlots")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSlotStart(slot.start)}
                  className={`rounded-lg border px-3 py-2 text-sm tabular-nums ${
                    slotStart === slot.start
                      ? "border-indigo-700 bg-indigo-50 text-indigo-800"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  {formatTime(new Date(slot.start))}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              {t("Booking.back")}
            </Button>
            <Button onClick={() => setStep(3)} disabled={!slotStart}>
              {t("Booking.next")}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!dentist) {
              setError(t("Errors.dentistMissing"));
              return;
            }
            try {
              actions.bookPublic({
                procedureId,
                dentistId: dentist.id,
                start: slotStart,
                fullName,
                phone,
              });
              setDone(true);
            } catch (caught) {
              setError(t(`Errors.${errorMessageKey(caught)}`));
            }
          }}
        >
          <h2 className="font-semibold">{t("Booking.stepDetails")}</h2>
          <Field label={t("Common.name")}>
            <TextInput
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </Field>
          <Field label={t("Common.phone")}>
            <TextInput
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0555 12 34 56"
              required
            />
          </Field>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              {t("Booking.back")}
            </Button>
            <Button type="submit">{t("Booking.submit")}</Button>
          </div>
        </form>
      ) : null}
    </Card>
  );
}
