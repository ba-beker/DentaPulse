"use client";

import { useLocale } from "next-intl";
import { formatQuantity } from "../lib/demo/quantity";

export function QuantityText({ count, unit }: { count: number; unit: string | undefined }) {
  const locale = useLocale();
  if (!unit) return <>{count}</>;
  return <>{formatQuantity(count, unit, locale)}</>;
}
