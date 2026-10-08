"use client";

import { formatDate, formatTime } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useDemo } from "../lib/demo/context";
import { useDisplayedClinic } from "./branding-bridge";
import { Button, Card } from "./ui";

export function ReminderPanel() {
  const t = useTranslations("Reminder");
  const clinic = useDisplayedClinic();
  const { state, actions } = useDemo();
  const [note, setNote] = useState<string | null>(null);

  const appointment = useMemo(() => {
    const now = Date.now();
    return [...state.appointments]
      .filter((row) => row.status !== "cancelled" && row.status !== "completed")
      .filter((row) => new Date(row.start).getTime() >= now)
      .sort((a, b) => a.start.localeCompare(b.start))[0];
  }, [state.appointments]);

  if (!appointment) {
    return (
      <Card>
        <h2 className="font-semibold text-zinc-950">{t("title")}</h2>
        <p className="mt-2 text-sm text-zinc-500">{t("empty")}</p>
      </Card>
    );
  }

  const patient = actions.lookupPatient(appointment.patientId);
  const vars = {
    patient: patient?.fullName ?? "",
    clinic: clinic.name,
    date: formatDate(new Date(appointment.start)),
    time: formatTime(new Date(appointment.start)),
  };
  const french = t("frBody", vars);
  const arabic = t("arBody", vars);

  function reply(status: "confirmed" | "cancelled") {
    actions.updateAppointment(appointment!.id, { status });
    setNote(status === "confirmed" ? t("confirmed") : t("cancelled"));
  }

  return (
    <Card>
      <h2 className="font-semibold text-zinc-950">{t("title")}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{t("subtitle")}</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <MessageBubble label={t("french")} dir="ltr" text={french} />
        <MessageBubble label={t("arabic")} dir="rtl" text={arabic} arabic />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => reply("confirmed")} disabled={appointment.status === "confirmed"}>
          {t("confirm")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => reply("cancelled")}
          disabled={appointment.status === "cancelled"}
        >
          {t("cancel")}
        </Button>
      </div>
      {note ? <p className="mt-3 text-sm text-emerald-800">{note}</p> : null}
    </Card>
  );
}

function MessageBubble({
  label,
  text,
  dir,
  arabic = false,
}: {
  label: string;
  text: string;
  dir: "ltr" | "rtl";
  arabic?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#e7f7ef] px-4 py-3" dir={dir}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#075e54]">{label}</p>
      <p
        className={`mt-2 text-sm leading-6 text-zinc-900 ${arabic ? "font-[family-name:var(--font-arabic)]" : ""}`}
      >
        {text}
      </p>
    </div>
  );
}
