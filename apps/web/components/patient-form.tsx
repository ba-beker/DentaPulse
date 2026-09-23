"use client";

import { createPatientBodySchema, updatePatientBodySchema, WILAYAS } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useDemo } from "../lib/demo/context";
import { errorMessageKey } from "../lib/demo/errors";
import type { PatientRecord } from "../lib/demo/types";
import { Button, Field, Select, TextInput } from "./ui";

export function PatientForm({ patient, onDone }: { patient?: PatientRecord; onDone: () => void }) {
  const t = useTranslations();
  const { actions } = useDemo();
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(patient?.fullName ?? "");
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [commune, setCommune] = useState(patient?.commune ?? "");
  const [wilaya, setWilaya] = useState(String(patient?.wilaya ?? 31));
  const [dateOfBirth, setDateOfBirth] = useState(patient?.dateOfBirth ?? "");
  const [allergies, setAllergies] = useState(patient?.allergies.join(", ") ?? "");
  const [medicalNotes, setMedicalNotes] = useState(patient?.medicalNotes ?? "");

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const allergyList = allergies
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    try {
      if (patient) {
        const parsed = updatePatientBodySchema.parse({
          fullName,
          phone,
          wilaya: Number(wilaya),
          ...(commune.trim() ? { commune: commune.trim() } : {}),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          allergies: allergyList,
          ...(medicalNotes ? { medicalNotes } : {}),
        });
        actions.updatePatient(patient.id, parsed);
      } else {
        const parsed = createPatientBodySchema.parse({
          fullName,
          phone,
          wilaya: Number(wilaya),
          ...(commune.trim() ? { commune: commune.trim() } : {}),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          allergies: allergyList,
          ...(medicalNotes ? { medicalNotes } : {}),
        });
        actions.createPatient(parsed);
      }
      onDone();
    } catch (caught) {
      setError(t(`Errors.${errorMessageKey(caught)}`));
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
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
      <Field label={t("Patients.wilaya")}>
        <Select value={wilaya} onChange={(event) => setWilaya(event.target.value)}>
          {WILAYAS.map((row) => (
            <option key={row.code} value={row.code}>
              {row.code} — {row.nameFr}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Patients.commune")}>
        <TextInput value={commune} onChange={(event) => setCommune(event.target.value)} />
      </Field>
      <Field label={t("Patients.birth")}>
        <TextInput
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
        />
      </Field>
      <Field label={t("Patients.allergies")}>
        <TextInput value={allergies} onChange={(event) => setAllergies(event.target.value)} />
      </Field>
      <Field label={t("Patients.notes")}>
        <textarea
          value={medicalNotes}
          onChange={(event) => setMedicalNotes(event.target.value)}
          className="min-h-24 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          {t("Common.cancel")}
        </Button>
        <Button type="submit">{patient ? t("Common.save") : t("Common.create")}</Button>
      </div>
    </form>
  );
}
