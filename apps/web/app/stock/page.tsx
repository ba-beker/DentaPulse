"use client";

import {
  formatDA,
  formatDate,
  stockMovementReasonLabels,
  stockStatus,
  stockStatusLabels,
  type AdjustStockReason,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button, Card, Field, Select, Sheet, StatusPill, TextInput } from "../../components/ui";
import { useDemo } from "../../lib/demo/context";
import { errorMessageKey } from "../../lib/demo/errors";
import type { ConsumableRecord } from "../../lib/demo/types";

function tone(status: ReturnType<typeof stockStatus>) {
  if (status === "in_stock") return "ok" as const;
  if (status === "out" || status === "expired") return "bad" as const;
  return "warn" as const;
}

export default function StockPage() {
  const t = useTranslations();
  const { ready, state } = useDemo();
  const [query, setQuery] = useState("");
  const [adjusting, setAdjusting] = useState<ConsumableRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.consumables.filter((row) => {
      if (!needle) return true;
      return row.name.toLowerCase().includes(needle) || row.sku.toLowerCase().includes(needle);
    });
  }, [query, state.consumables]);

  if (!ready) return <div className="min-h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Stock.title")}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t("Stock.subtitle")}</p>
        </div>
        <Button onClick={() => setCreating(true)}>{t("Stock.add")}</Button>
      </header>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <TextInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("Common.search")}
        aria-label={t("Common.search")}
      />

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t("Common.name")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Stock.current")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Stock.min")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Common.status")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("Common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = stockStatus(
                row.currentStock,
                row.minStockAlert,
                row.expirationDate ? new Date(`${row.expirationDate}T12:00:00+01:00`) : null,
              );
              return (
                <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-zinc-500">{row.category}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.currentStock} {row.unit}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.minStockAlert}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={stockStatusLabels[status]} tone={tone(status)} />
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="secondary" onClick={() => setAdjusting(row)}>
                      {t("Stock.adjust")}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">{t("Stock.movements")}</h2>
        <ul className="divide-y divide-zinc-100 text-sm">
          {state.movements.slice(0, 12).map((row) => {
            const item = state.consumables.find((consumable) => consumable.id === row.consumableId);
            return (
              <li key={row.id} className="flex justify-between gap-3 py-2">
                <span>
                  {item?.name ?? row.consumableId} · {stockMovementReasonLabels[row.reason]}
                </span>
                <span className="tabular-nums text-zinc-500">
                  {row.delta > 0 ? "+" : ""}
                  {row.delta} · {formatDate(new Date(row.createdAt))}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Sheet
        open={Boolean(adjusting)}
        title={t("Stock.adjust")}
        onClose={() => setAdjusting(null)}
        closeLabel={t("Common.close")}
      >
        {adjusting ? (
          <AdjustForm
            item={adjusting}
            onDone={() => {
              setAdjusting(null);
              setMessage(t("Stock.adjusted"));
            }}
          />
        ) : null}
      </Sheet>
      <Sheet
        open={creating}
        title={t("Stock.add")}
        onClose={() => setCreating(false)}
        closeLabel={t("Common.close")}
      >
        <CreateConsumableForm
          onDone={() => {
            setCreating(false);
            setMessage(t("Stock.created"));
          }}
        />
      </Sheet>
    </div>
  );
}

function AdjustForm({ item, onDone }: { item: ConsumableRecord; onDone: () => void }) {
  const t = useTranslations();
  const { actions } = useDemo();
  const [delta, setDelta] = useState("5");
  const [reason, setReason] = useState<AdjustStockReason>("purchase_receipt");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          actions.adjustStock(item.id, Number(delta), reason, note || undefined);
          onDone();
        } catch (caught) {
          setError(t(`Errors.${errorMessageKey(caught)}`));
        }
      }}
    >
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <p className="text-sm text-zinc-600">
        {item.name} · {item.currentStock} {item.unit}
      </p>
      <Field label={t("Stock.delta")}>
        <TextInput value={delta} onChange={(event) => setDelta(event.target.value)} />
      </Field>
      <Field label={t("Stock.reason")}>
        <Select
          value={reason}
          onChange={(event) => setReason(event.target.value as AdjustStockReason)}
        >
          <option value="purchase_receipt">{stockMovementReasonLabels.purchase_receipt}</option>
          <option value="manual_adjustment">{stockMovementReasonLabels.manual_adjustment}</option>
          <option value="waste">{stockMovementReasonLabels.waste}</option>
          <option value="expiry">{stockMovementReasonLabels.expiry}</option>
        </Select>
      </Field>
      <Field label={t("Stock.note")}>
        <TextInput value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <Button type="submit">{t("Common.confirm")}</Button>
    </form>
  );
}

function CreateConsumableForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations();
  const { actions } = useDemo();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Protection");
  const [unit, setUnit] = useState("unité");
  const [costPerUnit, setCostPerUnit] = useState("100");
  const [currentStock, setCurrentStock] = useState("20");
  const [minStockAlert, setMinStockAlert] = useState("5");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          actions.createConsumable({
            name,
            category,
            unit,
            costPerUnit: Number(costPerUnit),
            currentStock: Number(currentStock),
            minStockAlert: Number(minStockAlert),
          });
          onDone();
        } catch (caught) {
          setError(t(`Errors.${errorMessageKey(caught)}`));
        }
      }}
    >
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Field label={t("Common.name")}>
        <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label={t("Stock.category")}>
        <TextInput value={category} onChange={(event) => setCategory(event.target.value)} />
      </Field>
      <Field label={t("Stock.unit")}>
        <TextInput value={unit} onChange={(event) => setUnit(event.target.value)} />
      </Field>
      <Field label={t("Stock.cost")}>
        <TextInput value={costPerUnit} onChange={(event) => setCostPerUnit(event.target.value)} />
      </Field>
      <Field label={t("Stock.current")}>
        <TextInput value={currentStock} onChange={(event) => setCurrentStock(event.target.value)} />
      </Field>
      <Field label={t("Stock.min")}>
        <TextInput
          value={minStockAlert}
          onChange={(event) => setMinStockAlert(event.target.value)}
        />
      </Field>
      <p className="text-xs text-zinc-500">{formatDA(Number(costPerUnit) || 0)}</p>
      <Button type="submit">{t("Common.create")}</Button>
    </form>
  );
}
