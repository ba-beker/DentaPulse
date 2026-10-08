const FRENCH_PLURAL: Record<string, string> = {
  cartouche: "cartouches",
  unité: "unités",
  unite: "unités",
  paire: "paires",
  capsule: "capsules",
  dose: "doses",
  boîte: "boîtes",
  boite: "boîtes",
  flacon: "flacons",
  tube: "tubes",
  sachet: "sachets",
  rouleau: "rouleaux",
};

const ARABIC_UNIT: Record<string, [string, string]> = {
  cartouche: ["خرطوشة", "خراطيش"],
  unité: ["وحدة", "وحدات"],
  unite: ["وحدة", "وحدات"],
  paire: ["زوج", "أزواج"],
  capsule: ["كبسولة", "كبسولات"],
  dose: ["جرعة", "جرعات"],
  boîte: ["علبة", "علب"],
  boite: ["علبة", "علب"],
  flacon: ["قارورة", "قوارير"],
  tube: ["أنبوب", "أنابيب"],
  sachet: ["كيس", "أكياس"],
  rouleau: ["لفة", "لفّات"],
};

function frenchPlural(unit: string): string {
  const mapped = FRENCH_PLURAL[unit];
  if (mapped) return mapped;
  if (unit.endsWith("s") || unit.endsWith("x")) return unit;
  return `${unit}s`;
}

/** "1 cartouche", "2 cartouches", "6 unités", and the Arabic equivalents. */
export function formatQuantity(count: number, unit: string, locale = "fr"): string {
  const clean = unit.trim();
  const one = Math.abs(count) === 1;
  if (locale.startsWith("ar")) {
    const pair = ARABIC_UNIT[clean];
    if (pair) return `${count} ${one ? pair[0] : pair[1]}`;
  }
  return `${count} ${one ? clean : frenchPlural(clean)}`;
}
