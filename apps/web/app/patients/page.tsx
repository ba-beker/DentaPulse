"use client";

import { formatNational, riskTagLabels } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PatientForm } from "../../components/patient-form";
import { Button, Card, Sheet, StatusPill, TextInput } from "../../components/ui";
import { useDemo } from "../../lib/demo/context";

export default function PatientsPage() {
  const t = useTranslations();
  const { ready, state } = useDemo();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.patients.filter((patient) => {
      if (!needle) return true;
      return (
        patient.fullName.toLowerCase().includes(needle) ||
        patient.phone.includes(needle) ||
        patient.commune.toLowerCase().includes(needle)
      );
    });
  }, [query, state.patients]);

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Patients.title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("Patients.subtitle")}</p>
        </div>
        <Button onClick={() => setOpen(true)}>{t("Patients.add")}</Button>
      </header>

      <TextInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("Common.search")}
        aria-label={t("Common.search")}
      />

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-start text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("Common.name")}</th>
              <th className="px-4 py-3 font-medium">{t("Common.phone")}</th>
              <th className="px-4 py-3 font-medium">{t("Patients.commune")}</th>
              <th className="px-4 py-3 font-medium">{t("Patients.risks")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-zinc-500" colSpan={4}>
                  {t("Patients.empty")}
                </td>
              </tr>
            ) : (
              rows.map((patient) => (
                <tr key={patient.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/patients/${patient.id}`} className="font-medium text-teal-800">
                      {patient.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatNational(patient.phone) ?? patient.phone}
                  </td>
                  <td className="px-4 py-3">{patient.commune}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {patient.riskTags.map((tag) => (
                        <StatusPill key={tag} label={riskTagLabels[tag]} tone="warn" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Sheet
        open={open}
        title={t("Patients.add")}
        onClose={() => setOpen(false)}
        closeLabel={t("Common.close")}
      >
        <PatientForm onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  );
}
