"use client";

import { analyzeProcedureCost, formatDA } from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { Card } from "../../components/ui";
import { useDemo } from "../../lib/demo/context";

export default function ProceduresPage() {
  const t = useTranslations();
  const { ready, state } = useDemo();

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("Procedures.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("Procedures.subtitle")}</p>
      </header>
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
            <Card key={procedure.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{procedure.name}</h2>
                  <p className="text-sm text-zinc-500">{procedure.category}</p>
                </div>
                <p className="tabular-nums font-medium">{formatDA(procedure.basePrice)}</p>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                {t("Procedures.duration")} : {procedure.durationMinutes} min
              </p>
              <p className="text-sm text-zinc-600">
                {t("Procedures.feasible")} :{" "}
                {analysis.feasibleCount === null
                  ? t("Procedures.unlimited")
                  : analysis.feasibleCount}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                {procedure.consumables.map((line) => {
                  const item = state.consumables.find((row) => row.id === line.consumableId);
                  return (
                    <li key={line.consumableId}>
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
