"use client";

import {
  completedAgeYears,
  foldClinicalText,
  formatAgeFr,
  formatDate,
  formatNational,
  matchPrescriptionWarnings,
  ordonnanceCopy,
  type CatalogDrug,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { errorMessageKey } from "../lib/demo/errors";
import { useDemo } from "../lib/demo/context";
import type { DrugRecord, PatientRecord, PrescriptionRecord } from "../lib/demo/types";
import { Button, Card, Field, Sheet, TextInput } from "./ui";

const MAX_LINES = 10;

interface DraftLine {
  key: string;
  drug: string;
  dci: string;
  brand?: string;
  dosage: string;
  duration: string;
  instructions: string;
}

function drugTitle(drug: { dci: string; brand?: string }): string {
  return drug.brand ?? drug.dci;
}

function matchesQuery(drug: DrugRecord, query: string): boolean {
  const folded = foldClinicalText(query);
  if (!folded) return true;
  return [drug.dci, drug.brand ?? "", ...drug.aliases].some((value) =>
    foldClinicalText(value).includes(folded),
  );
}

export function PrescriptionPanel({
  patient,
  open,
  onOpenChange,
  onSaved,
}: {
  patient: PatientRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const t = useTranslations();
  const { state } = useDemo();
  const prescriptions = state.prescriptions.filter((row) => row.patientId === patient.id);
  const [printTarget, setPrintTarget] = useState<PrescriptionRecord | null>(null);
  const [printNonce, setPrintNonce] = useState(0);

  function requestPrint(record: PrescriptionRecord): void {
    setPrintTarget(record);
    setPrintNonce((value) => value + 1);
  }

  return (
    <>
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t("Prescription.title")}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t("Prescription.subtitle")}</p>
          </div>
          <Button onClick={() => onOpenChange(true)}>{t("Prescription.new")}</Button>
        </div>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("Prescription.empty")}</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {prescriptions.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatDate(new Date(row.createdAt))}
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-zinc-600">
                    {row.items.map((item, index) => (
                      <li key={`${row.id}-${index}`}>
                        {item.drug} — {item.dosage} — {item.duration}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary" onClick={() => requestPrint(row)}>
                  {t("Prescription.print")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Sheet
        open={open}
        wide
        title={t("Prescription.new")}
        onClose={() => onOpenChange(false)}
        closeLabel={t("Common.close")}
      >
        <PrescriptionForm
          patient={patient}
          onSaved={(record) => {
            onOpenChange(false);
            onSaved();
            requestPrint(record);
          }}
        />
      </Sheet>

      {printTarget ? (
        <OrdonnancePrint prescription={printTarget} patient={patient} nonce={printNonce} />
      ) : null}
    </>
  );
}

function PrescriptionForm({
  patient,
  onSaved,
}: {
  patient: PatientRecord;
  onSaved: (record: PrescriptionRecord) => void;
}) {
  const t = useTranslations();
  const { state, actions } = useDemo();
  const lineSeq = useRef(0);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [adding, setAdding] = useState(false);
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [ack, setAck] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const results = useMemo(
    () => state.drugs.filter((drug) => matchesQuery(drug, query)),
    [query, state.drugs],
  );

  const catalog: CatalogDrug[] = state.drugs;
  const warnings = useMemo(
    () =>
      matchPrescriptionWarnings(
        { riskTags: patient.riskTags, allergies: patient.allergies },
        lines.map((line) => ({
          drug: line.drug,
          dci: line.dci,
          ...(line.brand ? { brand: line.brand } : {}),
        })),
        catalog,
      ),
    [catalog, lines, patient.allergies, patient.riskTags],
  );
  const warningKey = warnings.map((warning) => `${warning.ruleId}:${warning.itemIndex}`).join("|");

  useEffect(() => {
    setAck(false);
  }, [warningKey]);

  const complete =
    lines.length > 0 &&
    lines.every((line) => line.dosage.trim().length > 0 && line.duration.trim().length > 0);
  const blockedByWarning = warnings.length > 0 && !ack;

  function addLine(drug: DrugRecord): void {
    if (lines.length >= MAX_LINES) {
      setFormError(t("Prescription.limit"));
      return;
    }
    lineSeq.current += 1;
    setLines((current) => [
      ...current,
      {
        key: `line-${lineSeq.current}`,
        drug: drugTitle(drug),
        dci: drug.dci,
        ...(drug.brand ? { brand: drug.brand } : {}),
        dosage: "",
        duration: "",
        instructions: "",
      },
    ]);
    setQuery("");
    setFormError(null);
  }

  function updateLine(
    key: string,
    patch: Partial<Pick<DraftLine, "dosage" | "duration" | "instructions">>,
  ): void {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!complete || blockedByWarning) return;
        try {
          const record = actions.createPrescription(patient.id, {
            items: lines.map((line) => ({
              drug: line.drug,
              dci: line.dci,
              ...(line.brand ? { brand: line.brand } : {}),
              dosage: line.dosage.trim(),
              duration: line.duration.trim(),
              ...(line.instructions.trim() ? { instructions: line.instructions.trim() } : {}),
            })),
            ...(ack ? { acknowledgeWarnings: true } : {}),
          });
          setLines([]);
          setAck(false);
          setFormError(null);
          onSaved(record);
        } catch (caught) {
          setFormError(t(`Errors.${errorMessageKey(caught)}`));
        }
      }}
    >
      {patient.allergies.length > 0 ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("Patients.allergies")} : {patient.allergies.join(", ")}
        </p>
      ) : null}

      <Field label={t("Prescription.search")}>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Prescription.searchPlaceholder")}
          autoComplete="off"
          aria-controls="drug-results"
        />
      </Field>

      <ul
        id="drug-results"
        className="max-h-52 overflow-y-auto rounded-lg border border-zinc-200"
        aria-label={t("Prescription.search")}
      >
        {results.length === 0 ? (
          <li className="px-3 py-2 text-sm text-zinc-500">{t("Prescription.noResults")}</li>
        ) : (
          results.map((drug) => (
            <li key={drug.id} className="border-b border-zinc-100 last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm hover:bg-zinc-50"
                onClick={() => addLine(drug)}
              >
                <span>
                  <span className="font-medium text-zinc-900">{drugTitle(drug)}</span>
                  {drug.brand ? <span className="text-zinc-500"> · {drug.dci}</span> : null}
                </span>
                {drug.custom ? (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {t("Prescription.custom")}
                  </span>
                ) : null}
              </button>
            </li>
          ))
        )}
      </ul>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3">
          <Field label={t("Prescription.productName")}>
            <TextInput
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              autoComplete="off"
              required
            />
          </Field>
          <Field label={t("Prescription.brand")} hint={t("Prescription.brandOptional")}>
            <TextInput
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              autoComplete="off"
            />
          </Field>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                const dci = productName.trim();
                if (!dci) return;
                try {
                  const drug = actions.createDrug({
                    dci,
                    ...(brand.trim() ? { brand: brand.trim() } : {}),
                  });
                  addLine(drug);
                  setProductName("");
                  setBrand("");
                  setAdding(false);
                } catch (caught) {
                  setFormError(t(`Errors.${errorMessageKey(caught)}`));
                }
              }}
            >
              {t("Prescription.addToList")}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setAdding(false)}>
              {t("Common.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setAdding(true)}>
          {t("Prescription.addProduct")}
        </Button>
      )}

      <div>
        <h3 className="text-sm font-medium text-zinc-800">
          {t("Prescription.lines")}
          {lines.length > 0 ? ` · ${t("Prescription.lineCount", { count: lines.length })}` : ""}
        </h3>
        {lines.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("Prescription.pick")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.key} className="rounded-lg border border-zinc-200 p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">
                    {line.drug}
                    {line.brand && line.dci !== line.drug ? (
                      <span className="font-normal text-zinc-500"> · {line.dci}</span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    className="text-sm text-rose-700"
                    onClick={() =>
                      setLines((current) => current.filter((row) => row.key !== line.key))
                    }
                  >
                    {t("Prescription.remove")}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("Prescription.dosage")}>
                    <TextInput
                      value={line.dosage}
                      placeholder={t("Prescription.dosagePlaceholder")}
                      onChange={(event) => updateLine(line.key, { dosage: event.target.value })}
                      required
                    />
                  </Field>
                  <Field label={t("Prescription.duration")}>
                    <TextInput
                      value={line.duration}
                      placeholder={t("Prescription.durationPlaceholder")}
                      onChange={(event) => updateLine(line.key, { duration: event.target.value })}
                      required
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label={t("Prescription.instructions")}>
                    <TextInput
                      value={line.instructions}
                      placeholder={t("Prescription.instructionsPlaceholder")}
                      onChange={(event) =>
                        updateLine(line.key, { instructions: event.target.value })
                      }
                    />
                  </Field>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-lg bg-rose-50 px-3 py-3 text-sm text-rose-800">
          <ul className="space-y-1">
            {warnings.map((warning) => (
              <li key={`${warning.ruleId}-${warning.itemIndex}`}>{warning.message}</li>
            ))}
          </ul>
          <label className="mt-3 flex items-start gap-2 text-zinc-800">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={ack}
              onChange={(event) => setAck(event.target.checked)}
            />
            <span>{t("Prescription.acknowledge")}</span>
          </label>
        </div>
      ) : null}

      {formError ? <p className="text-sm text-rose-700">{formError}</p> : null}

      <Button type="submit" disabled={!complete || blockedByWarning}>
        {t("Common.save")}
      </Button>
    </form>
  );
}

function OrdonnancePrint({
  prescription,
  patient,
  nonce,
}: {
  prescription: PrescriptionRecord;
  patient: PatientRecord;
  nonce: number;
}) {
  const { state } = useDemo();
  const dentist = state.users.find((row) => row.id === prescription.dentistId);
  const phone = formatNational(state.clinic.phone) ?? state.clinic.phone;
  const birth = patient.dateOfBirth ? new Date(`${patient.dateOfBirth}T12:00:00+01:00`) : null;
  const age =
    birth && !Number.isNaN(birth.getTime())
      ? formatAgeFr(completedAgeYears(birth, new Date(prescription.createdAt)))
      : null;
  const place = ordonnanceCopy.madeAt
    .replace("{commune}", state.clinic.commune)
    .replace("{date}", formatDate(new Date(prescription.createdAt)));

  useEffect(() => {
    if (nonce === 0) return;
    const frame = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(frame);
  }, [nonce]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <article className="ordonnance-print">
      <header className="border-b border-zinc-300 pb-4">
        <p className="text-lg font-semibold">{state.clinic.name}</p>
        <p className="mt-1 text-sm">{dentist?.fullName ?? state.clinic.doctorName}</p>
        <p className="text-sm text-zinc-600">{ordonnanceCopy.dentist}</p>
        <p className="mt-2 text-sm">
          {state.clinic.address}, {state.clinic.commune}
        </p>
        <p className="text-sm tabular-nums">{phone}</p>
      </header>
      <h1 className="mt-6 text-center text-xl font-semibold tracking-wide">
        {ordonnanceCopy.title}
      </h1>
      <div className="mt-6 text-sm">
        <p>
          <span className="text-zinc-500">{ordonnanceCopy.patient}</span> — {patient.fullName}
        </p>
        {age ? (
          <p>
            <span className="text-zinc-500">{ordonnanceCopy.ageLabel}</span> — {age}
          </p>
        ) : null}
      </div>
      <p className="mt-4 text-sm">{place}</p>
      <ol className="mt-6 list-decimal space-y-4 ps-5">
        {prescription.items.map((item, index) => (
          <li key={`${prescription.id}-${index}`} className="text-sm">
            <p className="font-semibold">{item.drug}</p>
            {item.dci && item.dci !== item.drug ? (
              <p className="text-zinc-600">{item.dci}</p>
            ) : null}
            <p className="mt-1">{item.dosage}</p>
            <p>
              {ordonnanceCopy.duration} : {item.duration}
            </p>
            {item.instructions ? <p className="text-zinc-600">{item.instructions}</p> : null}
          </li>
        ))}
      </ol>
      <footer className="mt-16 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p>{ordonnanceCopy.signature}</p>
          <div className="mt-16 border-t border-zinc-400" />
        </div>
        <div>
          <p>{ordonnanceCopy.stamp}</p>
          <div className="mt-3 h-24 w-24 rounded-full border border-dashed border-zinc-400" />
        </div>
      </footer>
    </article>,
    document.body,
  );
}
