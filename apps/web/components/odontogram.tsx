"use client";

import {
  ADULT_TEETH,
  PEDIATRIC_TEETH,
  surfacesFor,
  toothConditionLabels,
  toothMeta,
  type Dentition,
  type Surface,
  type ToothCondition,
} from "@dentapulse/shared";
import { useTranslations } from "next-intl";
import type { ToothStateRecord } from "../lib/demo/types";

const CONDITION_FILL: Record<ToothCondition, string> = {
  healthy: "#f4f4f5",
  caries: "#f87171",
  filling: "#34d399",
  crown: "#38bdf8",
  implant: "#38bdf8",
  missing: "#a1a1aa",
  endodontic: "#818cf8",
  bridge: "#22d3ee",
  fracture: "#fbbf24",
  extraction_planned: "#fb7185",
};

function fillFor(tooth: ToothStateRecord | undefined, surface?: Surface): string {
  if (!tooth) return CONDITION_FILL.healthy;
  if (tooth.wholeCondition !== "healthy") return CONDITION_FILL[tooth.wholeCondition];
  if (surface && tooth.surfaces[surface]) {
    return CONDITION_FILL[tooth.surfaces[surface] ?? "healthy"];
  }
  return CONDITION_FILL.healthy;
}

function teethFor(dentition: Dentition): readonly number[] {
  if (dentition === "pediatric") return PEDIATRIC_TEETH;
  if (dentition === "mixed") return [...ADULT_TEETH, ...PEDIATRIC_TEETH];
  return ADULT_TEETH;
}

function ToothSvg({
  fdi,
  tooth,
  selected,
  onSelect,
}: {
  fdi: number;
  tooth?: ToothStateRecord;
  selected: boolean;
  onSelect: (fdi: number) => void;
}) {
  const first = surfacesFor(fdi)[0] ?? "O";
  const stroke = selected ? "#4338ca" : "#d4d4d8";
  return (
    <button
      type="button"
      onClick={() => onSelect(fdi)}
      className="flex flex-col items-center gap-1 rounded-md p-0.5"
      aria-label={`Dent ${fdi}`}
      aria-pressed={selected}
    >
      <svg viewBox="0 0 40 48" className="h-12 w-10" aria-hidden>
        <polygon
          points="8,2 32,2 38,16 32,30 8,30 2,16"
          fill={fillFor(tooth, "B")}
          stroke={stroke}
        />
        <polygon points="2,16 8,30 8,46 2,40" fill={fillFor(tooth, "M")} stroke={stroke} />
        <polygon points="32,30 38,16 38,40 32,46" fill={fillFor(tooth, "D")} stroke={stroke} />
        <polygon points="8,30 32,30 32,46 8,46" fill={fillFor(tooth, "L")} stroke={stroke} />
        <rect
          x="11"
          y="12"
          width="18"
          height="14"
          rx="2"
          fill={fillFor(tooth, first)}
          stroke={stroke}
        />
      </svg>
      <span className="tabular text-[11px] text-zinc-600">{fdi}</span>
    </button>
  );
}

export function Odontogram({
  dentition,
  teeth,
  selectedFdi,
  onSelect,
}: {
  dentition: Dentition;
  teeth: ToothStateRecord[];
  selectedFdi: number | null;
  onSelect: (fdi: number) => void;
}) {
  const t = useTranslations("Odontogram");
  const byFdi = new Map(teeth.map((tooth) => [tooth.fdi, tooth]));
  const list = teethFor(dentition);
  const upper = list.filter((fdi) => toothMeta(fdi).arch === "upper");
  const lower = list.filter((fdi) => toothMeta(fdi).arch === "lower");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("upper")}
        </p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {upper.map((fdi) => (
            <ToothSvg
              key={fdi}
              fdi={fdi}
              tooth={byFdi.get(fdi)}
              selected={selectedFdi === fdi}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("lower")}
        </p>
        <div className="flex flex-wrap justify-center gap-0.5">
          {lower.map((fdi) => (
            <ToothSvg
              key={fdi}
              fdi={fdi}
              tooth={byFdi.get(fdi)}
              selected={selectedFdi === fdi}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
        <span className="w-full font-medium text-zinc-500">{t("legend")}</span>
        {(Object.keys(CONDITION_FILL) as ToothCondition[]).map((condition) => (
          <span key={condition} className="inline-flex items-center gap-1">
            <span
              className="size-2.5 rounded-sm border border-zinc-300"
              style={{ background: CONDITION_FILL[condition] }}
            />
            {toothConditionLabels[condition]}
          </span>
        ))}
      </div>
    </div>
  );
}
