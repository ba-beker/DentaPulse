/**
 * Stable machine-readable codes. The web app maps these to French;
 * `apiErrorMessages` is only the patient-safe default the API sends.
 */
export const apiErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  OVERPAYMENT: "OVERPAYMENT",
  PLAN_LOCKED: "PLAN_LOCKED",
  PRESCRIPTION_ACK_REQUIRED: "PRESCRIPTION_ACK_REQUIRED",
  ATTACHMENT_TYPE_MISMATCH: "ATTACHMENT_TYPE_MISMATCH",
  ATTACHMENT_NOT_UPLOADED: "ATTACHMENT_NOT_UPLOADED",
  STORAGE_UNAVAILABLE: "STORAGE_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
  SLOT_TAKEN: "SLOT_TAKEN",
  INTERNAL: "INTERNAL",
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];

export const apiErrorMessages = {
  VALIDATION_ERROR: "Les informations envoyées sont invalides.",
  UNAUTHENTICATED: "Authentification requise.",
  INVALID_CREDENTIALS: "L'adresse e-mail ou le mot de passe est incorrect.",
  ACCOUNT_LOCKED: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
  FORBIDDEN: "Vous n'avez pas l'autorisation d'effectuer cette action.",
  NOT_FOUND: "La ressource demandée est introuvable.",
  CONFLICT: "Cette opération entre en conflit avec des données existantes.",
  INSUFFICIENT_STOCK: "Le stock est insuffisant pour réaliser cet acte.",
  OVERPAYMENT: "Le versement dépasse le reste à payer.",
  PLAN_LOCKED: "Ce plan de traitement est terminé et ne peut plus être modifié.",
  PRESCRIPTION_ACK_REQUIRED:
    "Des alertes médicales doivent être confirmées avant d'enregistrer l'ordonnance.",
  ATTACHMENT_TYPE_MISMATCH: "Le fichier reçu ne correspond pas au type ou à la taille annoncés.",
  ATTACHMENT_NOT_UPLOADED: "Le fichier n'a pas encore été reçu. Réessayez dans un instant.",
  STORAGE_UNAVAILABLE: "Le stockage des fichiers n'est pas disponible.",
  RATE_LIMITED: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
  SLOT_TAKEN: "Ce créneau n'est plus disponible.",
  INTERNAL: "Une erreur interne s'est produite. Veuillez réessayer plus tard.",
} as const satisfies Record<ApiErrorCode, string>;

export const apiClientMessages = {
  invalidJson: "Le corps de la requête n'est pas un JSON valide.",
  payloadTooLarge: "La requête est trop volumineuse.",
} as const;
