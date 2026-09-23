import { z, util, ZodIssueCode, ZodParsedType, type ZodErrorMap } from "zod";
import { formatDate } from "../locale/format.js";

const typeLabels = {
  string: "texte",
  nan: "non numérique",
  number: "nombre",
  integer: "entier",
  float: "nombre décimal",
  boolean: "booléen",
  date: "date",
  bigint: "grand entier",
  symbol: "symbole",
  function: "fonction",
  undefined: "vide",
  null: "nul",
  array: "liste",
  object: "objet",
  unknown: "inconnu",
  promise: "promesse",
  void: "vide",
  never: "valeur impossible",
  map: "table",
  set: "ensemble",
} as const satisfies Record<ZodParsedType, string>;

const stringLabels: Record<string, string> = {
  email: "Adresse e-mail invalide.",
  url: "Adresse web invalide.",
  emoji: "Émoji invalide.",
  uuid: "Identifiant invalide.",
  nanoid: "Identifiant invalide.",
  cuid: "Identifiant invalide.",
  cuid2: "Identifiant invalide.",
  ulid: "Identifiant invalide.",
  datetime: "Date et heure invalides.",
  date: "Date invalide.",
  time: "Heure invalide.",
  duration: "Durée invalide.",
  ip: "Adresse IP invalide.",
  cidr: "Plage réseau invalide.",
  base64: "Texte encodé invalide.",
  jwt: "Jeton invalide.",
  base64url: "Texte encodé invalide.",
  regex: "Format invalide.",
};

function typeLabel(type: ZodParsedType): string {
  return typeLabels[type];
}

function unit(count: number | bigint, one: string, many: string): string {
  return Math.abs(Number(count)) > 1 ? many : one;
}

function countRequirement(
  direction: "small" | "big",
  exact: boolean | undefined,
  inclusive: boolean,
  bound: number | bigint,
): string {
  if (exact) return `contenir exactement ${bound}`;
  if (direction === "small") {
    return inclusive ? `contenir au moins ${bound}` : `contenir plus de ${bound}`;
  }
  return inclusive ? `contenir au plus ${bound}` : `contenir moins de ${bound}`;
}

function numberRequirement(
  direction: "small" | "big",
  exact: boolean | undefined,
  inclusive: boolean,
  bound: number | bigint,
): string {
  if (exact) return `être égal à ${bound}`;
  if (direction === "small") {
    return inclusive ? `être supérieur ou égal à ${bound}` : `être supérieur à ${bound}`;
  }
  return inclusive ? `être inférieur ou égal à ${bound}` : `être inférieur à ${bound}`;
}

function formatBoundDate(value: number | bigint): string {
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return formatDate(date);
}

function dateRequirement(
  direction: "small" | "big",
  exact: boolean | undefined,
  inclusive: boolean,
  bound: number | bigint,
): string {
  const formatted = formatBoundDate(bound);
  if (exact) return `être le ${formatted}`;
  if (direction === "small") {
    return inclusive ? `être le ${formatted} ou après` : `être après le ${formatted}`;
  }
  return inclusive ? `être le ${formatted} ou avant` : `être avant le ${formatted}`;
}

function sizeMessage(
  direction: "small" | "big",
  issue: {
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
    inclusive: boolean;
    exact?: boolean;
    minimum?: number | bigint;
    maximum?: number | bigint;
  },
): string {
  const bound = direction === "small" ? issue.minimum : issue.maximum;
  if (bound === undefined) return "Valeur invalide.";

  if (issue.type === "string") {
    const word = unit(bound, "caractère", "caractères");
    return `Le texte doit ${countRequirement(direction, issue.exact, issue.inclusive, bound)} ${word}.`;
  }
  if (issue.type === "array") {
    const word = unit(bound, "élément", "éléments");
    return `La liste doit ${countRequirement(direction, issue.exact, issue.inclusive, bound)} ${word}.`;
  }
  if (issue.type === "set") {
    const word = unit(bound, "élément", "éléments");
    return `L'ensemble doit ${countRequirement(direction, issue.exact, issue.inclusive, bound)} ${word}.`;
  }
  if (issue.type === "date") {
    return `La date doit ${dateRequirement(direction, issue.exact, issue.inclusive, bound)}.`;
  }
  return `Le nombre doit ${numberRequirement(direction, issue.exact, issue.inclusive, bound)}.`;
}

function invalidStringMessage(
  validation:
    | string
    | { includes: string; position?: number }
    | { startsWith: string }
    | { endsWith: string },
): string {
  if (typeof validation === "string") {
    return stringLabels[validation] ?? "Format invalide.";
  }
  if ("includes" in validation) {
    const position =
      typeof validation.position === "number"
        ? ` à partir de la position ${validation.position}`
        : "";
    return `Le texte doit contenir « ${validation.includes} »${position}.`;
  }
  if ("startsWith" in validation) {
    return `Le texte doit commencer par « ${validation.startsWith} ».`;
  }
  return `Le texte doit se terminer par « ${validation.endsWith} ».`;
}

const frenchZodErrorMap: ZodErrorMap = (issue, _ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        return { message: "Ce champ est requis." };
      }
      return {
        message: `Type attendu : ${typeLabel(issue.expected)}. Type reçu : ${typeLabel(issue.received)}.`,
      };
    case ZodIssueCode.invalid_literal:
      return { message: "Valeur littérale invalide." };
    case ZodIssueCode.unrecognized_keys:
      return { message: `Clé inconnue : ${issue.keys.join(", ")}.` };
    case ZodIssueCode.invalid_union:
      return { message: "Valeur invalide." };
    case ZodIssueCode.invalid_union_discriminator:
      return {
        message: `Le type indiqué est invalide. Valeurs attendues : ${issue.options.join(", ")}.`,
      };
    case ZodIssueCode.invalid_enum_value:
      return {
        message: `Valeur non autorisée. Valeurs attendues : ${issue.options.join(", ")}.`,
      };
    case ZodIssueCode.invalid_arguments:
      return { message: "Arguments invalides." };
    case ZodIssueCode.invalid_return_type:
      return { message: "Type de retour invalide." };
    case ZodIssueCode.invalid_date:
      return { message: "Date invalide." };
    case ZodIssueCode.invalid_string:
      return { message: invalidStringMessage(issue.validation) };
    case ZodIssueCode.too_small:
      return { message: sizeMessage("small", issue) };
    case ZodIssueCode.too_big:
      return { message: sizeMessage("big", issue) };
    case ZodIssueCode.custom:
      return { message: "Valeur invalide." };
    case ZodIssueCode.invalid_intersection_types:
      return { message: "Ces valeurs ne peuvent pas être combinées." };
    case ZodIssueCode.not_multiple_of:
      return { message: `Le nombre doit être un multiple de ${issue.multipleOf}.` };
    case ZodIssueCode.not_finite:
      return { message: "Le nombre doit être fini." };
    default:
      return util.assertNever(issue);
  }
};

let installed = false;

/** Installs the French zod error map once for this process. */
export function installFrenchZodErrorMap(): void {
  if (installed) return;
  z.setErrorMap(frenchZodErrorMap);
  installed = true;
}
