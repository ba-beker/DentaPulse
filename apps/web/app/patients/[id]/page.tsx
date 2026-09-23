"use client";

import {
  dentitionLabels,
  formatDA,
  formatDate,
  recordedPaymentMethodLabels,
  stockStatusLabels,
  toothConditionLabels,
  type Dentition,
  type RecordedPaymentMethod,
  type ToothCondition,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Odontogram } from "../../../components/odontogram";
import { PatientForm } from "../../../components/patient-form";
import { PrescriptionPanel } from "../../../components/prescription-panel";
import { Button, Card, Field, Select, Sheet, TextInput } from "../../../components/ui";
import { useDemo } from "../../../lib/demo/context";
import { errorMessageKey } from "../../../lib/demo/errors";

const CONDITIONS: ToothCondition[] = [
  "healthy",
  "caries",
  "filling",
  "crown",
  "endodontic",
  "missing",
  "implant",
  "bridge",
  "fracture",
  "extraction_planned",
];

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations();
  const { ready, state, actions } = useDemo();
  const [editOpen, setEditOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedFdi, setSelectedFdi] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patient = state.patients.find((row) => row.id === params.id);
  const chart = state.charts.find((row) => row.patientId === params.id);
  const records = state.clinicalRecords.filter((row) => row.patientId === params.id);
  const plans = state.treatmentPlans.filter((row) => row.patientId === params.id);
  const balance = patient ? actions.patientFinancials(patient.id) : null;
  const history = selectedFdi && patient ? actions.toothHistory(patient.id, selectedFdi) : [];

  if (!ready) return <div className="min-h-96" />;
  if (!patient) {
    return <p className="text-sm text-rose-700">{t("Errors.patientNotFound")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/patients" className="text-sm text-teal-700">
          {t("Common.back")}
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{patient.fullName}</h1>
            <p className="mt-1 text-sm text-zinc-600">{patient.phone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setRxOpen(true)}>{t("Prescription.new")}</Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              {t("Common.edit")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(t("Patients.deleteConfirm"))) {
                  actions.deletePatient(patient.id);
                  router.push("/patients");
                }
              }}
            >
              {t("Common.delete")}
            </Button>
          </div>
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <PrescriptionPanel
        patient={patient}
        open={rxOpen}
        onOpenChange={setRxOpen}
        onSaved={() => {
          setError(null);
          setMessage(t("Prescription.saved"));
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">{t("Patient.billed")}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {formatDA(balance?.billed ?? 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">{t("Patient.paid")}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{formatDA(balance?.paid ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">{t("Patient.outstanding")}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {formatDA(balance?.outstanding ?? 0)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">{t("Patient.chart")}</h2>
          <div className="flex flex-wrap gap-2">
            <Select
              value={chart?.dentition ?? "adult"}
              onChange={(event) => {
                try {
                  actions.patchDentition(patient.id, event.target.value as Dentition);
                  setError(null);
                } catch (caught) {
                  setError(t(`Errors.${errorMessageKey(caught)}`));
                }
              }}
              aria-label={t("Patient.dentition")}
              className="w-auto"
            >
              {Object.entries(dentitionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button onClick={() => setCareOpen(true)}>{t("Patient.complete")}</Button>
            <Button variant="secondary" onClick={() => setPayOpen(true)}>
              {t("Patient.pay")}
            </Button>
          </div>
        </div>
        <Odontogram
          dentition={chart?.dentition ?? "adult"}
          teeth={chart?.teeth ?? []}
          selectedFdi={selectedFdi}
          onSelect={setSelectedFdi}
        />
        <p className="mt-4 text-sm text-zinc-500">{t("Patient.selectTooth")}</p>
        {selectedFdi ? (
          <ToothEditor
            key={selectedFdi}
            fdi={selectedFdi}
            condition={
              chart?.teeth.find((tooth) => tooth.fdi === selectedFdi)?.wholeCondition ?? "healthy"
            }
            notes={chart?.teeth.find((tooth) => tooth.fdi === selectedFdi)?.notes ?? ""}
            onSave={(condition, notes) => {
              try {
                actions.patchTooth(patient.id, selectedFdi, { wholeCondition: condition, notes });
                setError(null);
                setMessage(t("Patients.updated"));
              } catch (caught) {
                setError(t(`Errors.${errorMessageKey(caught)}`));
              }
            }}
          />
        ) : null}
        {selectedFdi ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium">{t("Patient.tooth", { fdi: selectedFdi })}</h3>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">{t("Patient.noHistory")}</p>
            ) : (
              <ul className="mt-2 divide-y divide-zinc-100 text-sm">
                {history.map((row) => (
                  <li key={row.id} className="py-2">
                    {formatDate(new Date(row.performedAt))} — {row.procedureName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">{t("Patient.history")}</h2>
        <ul className="divide-y divide-zinc-100 text-sm">
          {records.slice(0, 12).map((row) => (
            <li key={row.id} className="flex justify-between gap-3 py-2">
              <span>
                {row.procedureName}
                {row.toothNumber ? ` · ${row.toothNumber}` : ""}
              </span>
              <span className="tabular-nums text-zinc-500">
                {formatDate(new Date(row.performedAt))} · {formatDA(row.totalBilled)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">{t("Patient.plans")}</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("Patient.noPlans")}</p>
        ) : (
          <ul className="space-y-4">
            {plans.map((plan) => (
              <li key={plan.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
                <p className="font-medium tabular-nums">{formatDA(plan.total)}</p>
                <ul className="mt-2 space-y-1 text-zinc-600">
                  {plan.installments.map((row) => (
                    <li key={row.number}>
                      {t("Patient.installment", { number: row.number })} · {formatDA(row.amount)} ·{" "}
                      {formatDate(new Date(`${row.dueDate}T12:00:00+01:00`))}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Sheet
        open={editOpen}
        title={t("Patients.edit")}
        onClose={() => setEditOpen(false)}
        closeLabel={t("Common.close")}
      >
        <PatientForm patient={patient} onDone={() => setEditOpen(false)} />
      </Sheet>
      <Sheet
        open={careOpen}
        title={t("Patient.complete")}
        onClose={() => setCareOpen(false)}
        closeLabel={t("Common.close")}
      >
        <CompleteCareForm
          patientId={patient.id}
          toothNumber={selectedFdi}
          onDone={() => {
            setCareOpen(false);
            setMessage(t("Patient.completed"));
          }}
          onError={(key) => setError(t(`Errors.${key}`))}
        />
      </Sheet>
      <Sheet
        open={payOpen}
        title={t("Patient.pay")}
        onClose={() => setPayOpen(false)}
        closeLabel={t("Common.close")}
      >
        <PaymentForm
          patientId={patient.id}
          onDone={() => {
            setPayOpen(false);
            setMessage(t("Patient.paidOk"));
          }}
          onError={(key) => setError(t(`Errors.${key}`))}
        />
      </Sheet>
    </div>
  );
}

function ToothEditor({
  fdi,
  condition,
  notes,
  onSave,
}: {
  fdi: number;
  condition: ToothCondition;
  notes: string;
  onSave: (condition: ToothCondition, notes: string) => void;
}) {
  const t = useTranslations();
  const [value, setValue] = useState(condition);
  const [note, setNote] = useState(notes);

  return (
    <div className="mt-4 grid gap-3 rounded-lg border border-zinc-200 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <Field label={`${t("Patient.tooth", { fdi })} — ${t("Patient.condition")}`}>
        <Select value={value} onChange={(event) => setValue(event.target.value as ToothCondition)}>
          {CONDITIONS.map((item) => (
            <option key={item} value={item}>
              {toothConditionLabels[item]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Common.notes")}>
        <TextInput value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <div className="flex items-end">
        <Button onClick={() => onSave(value, note)}>{t("Common.save")}</Button>
      </div>
    </div>
  );
}

function CompleteCareForm({
  patientId,
  toothNumber,
  onDone,
  onError,
}: {
  patientId: string;
  toothNumber: number | null;
  onDone: () => void;
  onError: (key: string) => void;
}) {
  const t = useTranslations();
  const { state, actions } = useDemo();
  const [procedureId, setProcedureId] = useState(state.procedures[0]?.id ?? "");
  const preview = useMemo(
    () => (procedureId ? actions.previewTreatment(procedureId) : null),
    [actions, procedureId, state.consumables],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          actions.completeTreatment({
            patientId,
            procedureId,
            ...(toothNumber ? { toothNumber } : {}),
          });
          onDone();
        } catch (caught) {
          onError(errorMessageKey(caught));
        }
      }}
    >
      <Field label={t("Patient.procedure")}>
        <Select value={procedureId} onChange={(event) => setProcedureId(event.target.value)}>
          {state.procedures.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name} — {formatDA(row.basePrice)}
            </option>
          ))}
        </Select>
      </Field>
      {preview ? (
        <div>
          <p className="mb-2 text-sm font-medium">{t("Patient.preview")}</p>
          <ul className="space-y-1 text-sm text-zinc-600">
            {preview.consumed.map((line) => {
              const item = state.consumables.find((row) => row.id === line.consumableId);
              const short = preview.short.find((row) => row.consumableId === line.consumableId);
              return (
                <li key={line.consumableId} className="flex justify-between gap-2">
                  <span>{item?.name}</span>
                  <span className={short ? "text-rose-700" : ""}>
                    {line.quantity} {item?.unit}
                    {short ? ` · ${stockStatusLabels.out}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          {!preview.canPerform ? (
            <p className="mt-2 text-sm text-rose-700">{t("Patient.blocked")}</p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={!preview?.canPerform}>
        {t("Common.confirm")}
      </Button>
    </form>
  );
}

function PaymentForm({
  patientId,
  onDone,
  onError,
}: {
  patientId: string;
  onDone: () => void;
  onError: (key: string) => void;
}) {
  const t = useTranslations();
  const { state, actions } = useDemo();
  const plans = state.treatmentPlans.filter((row) => row.patientId === patientId);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [amount, setAmount] = useState("10000");
  const [method, setMethod] = useState<RecordedPaymentMethod>("cash");
  const [installmentNo, setInstallmentNo] = useState("1");
  const plan = plans.find((row) => row.id === planId);

  if (plans.length === 0) {
    return <p className="text-sm text-zinc-500">{t("Patient.noPlans")}</p>;
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          actions.createPayment({
            patientId,
            treatmentPlanId: planId,
            amount: Number(amount),
            method,
            installmentNo: Number(installmentNo),
          });
          onDone();
        } catch (caught) {
          onError(errorMessageKey(caught));
        }
      }}
    >
      <Field label={t("Patient.plans")}>
        <Select value={planId} onChange={(event) => setPlanId(event.target.value)}>
          {plans.map((row) => (
            <option key={row.id} value={row.id}>
              {formatDA(row.total)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Patient.installmentNo")}>
        <Select value={installmentNo} onChange={(event) => setInstallmentNo(event.target.value)}>
          {(plan?.installments ?? []).map((row) => (
            <option key={row.number} value={row.number}>
              {t("Patient.installment", { number: row.number })}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("Patient.amount")}>
        <TextInput
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="numeric"
        />
      </Field>
      <Field label={t("Patient.method")}>
        <Select
          value={method}
          onChange={(event) => setMethod(event.target.value as RecordedPaymentMethod)}
        >
          {Object.entries(recordedPaymentMethodLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit">{t("Common.confirm")}</Button>
    </form>
  );
}
