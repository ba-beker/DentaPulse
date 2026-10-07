"use client";

import { analyzeProcedureCost, formatDA } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { Card, PageHeader } from "../../components/ui";
import { useDemo } from "../../lib/demo/context";

export default function ProceduresPage() {
  const t = useTranslations();
  const { ready, state } = useDemo();

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("Procedures.title")} subtitle={t("Procedures.subtitle")} />
      <div className="grid gap-4 md:grid-cols-2">
        {state.procedures.map((procedure) => {
          const lines = procedure.consumables.map((line) => {
            const item = state.consumables.find((row) => row.id === line.consumableId);
            return {
              consumableId: line.consumableId,
              quantityUsed: line.quantityUsed,
              costPerUnit: item?.costPerUnit ?? 0,
              currentStock: item?.currentStock ?? 0,
            };
          });
          const analysis = analyzeProcedureCost(procedure.basePrice, lines);
          return (
            <Card key={procedure.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
                    {procedure.category}
                  </p>
                  <h2 className="mt-1 font-semibold text-zinc-950">{procedure.name}</h2>
                </div>
                <p className="rounded-xl bg-teal-50 px-2.5 py-1 text-sm font-semibold text-teal-900 tabular-nums">
                  {formatDA(procedure.basePrice)}
                </p>
              </div>
              <p className="mt-4 text-sm text-zinc-600">
                {t("Procedures.duration")} : {procedure.durationMinutes} min
              </p>
              <p className="text-sm text-zinc-600">
                {t("Procedures.feasible")} :{" "}
                {analysis.feasibleCount === null
                  ? t("Procedures.unlimited")
                  : analysis.feasibleCount}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {procedure.consumables.map((line) => {
                  const item = state.consumables.find((row) => row.id === line.consumableId);
                  return (
                    <li
                      key={line.consumableId}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700"
                    >
                      {item?.name} · {line.quantityUsed} {item?.unit}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
