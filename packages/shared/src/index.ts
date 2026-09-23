import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  db: z.enum(["up", "down"]),
  replicaSet: z.string().nullable(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export {
  ADULT_QUADRANTS,
  ADULT_TEETH,
  DENTITIONS,
  MIXED_DENTITION_FROM_YEARS,
  PEDIATRIC_QUADRANTS,
  PEDIATRIC_TEETH,
  PERMANENT_DENTITION_FROM_YEARS,
  chartRows,
  defaultDentition,
  isValidFdi,
  quadrantsFor,
  teethInQuadrant,
  toothMeta,
} from "./teeth.js";
export type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothDentition,
  ToothMeta,
  ToothType,
} from "./teeth.js";

export { applyToothUpdate, dentitionFitsTeeth, toothInDentition } from "./chart-rules.js";
export type {
  ChartRuleError,
  ChartToothState,
  ToothPatch,
  ToothUpdateResult,
} from "./chart-rules.js";
export { surfaceSchema, surfacesFor } from "./surfaces.js";
export type { Surface } from "./surfaces.js";

export {
  adjustStockReasonSchema,
  appointmentStatusSchema,
  paymentMethodSchema,
  riskTagSchema,
  roleSchema,
  stockMovementReasonSchema,
  stockStatusSchema,
  toothConditionSchema,
  treatmentStatusSchema,
} from "./enums.js";
export type {
  AdjustStockReason,
  AppointmentStatus,
  PaymentMethod,
  RiskTag,
  Role,
  StockMovementReason,
  StockStatus,
  ToothCondition,
  TreatmentStatus,
} from "./enums.js";

export {
  addCalendarDays,
  allocateByWeights,
  installmentDueDates,
  patientBalance,
  splitInstallments,
} from "./billing.js";
export type {
  BalancePaymentInput,
  BalancePlanInput,
  OverdueInstallment,
  PatientBalance,
} from "./billing.js";
export { analyzeProcedureCost, previewProcedureDeduction } from "./procedure-cost.js";
export type {
  ProcedureCostAnalysis,
  ProcedureCostLine,
  ProcedureCostLineInput,
  ProcedureDeductionConsumed,
  ProcedureDeductionLineInput,
  ProcedureDeductionPreview,
  ProcedureDeductionShort,
} from "./procedure-cost.js";

export {
  DEFAULT_EXPIRY_ALERT_DAYS,
  EXPIRING_SOON_DAYS,
  addIsoDays,
  percentOfMin,
  stockStatus,
} from "./stock.js";

export {
  adjustStockBodySchema,
  appointmentParamsSchema,
  appointmentSchemas,
  authSchemas,
  clinicalRecordParamsSchema,
  clinicalRecordSchemas,
  clinicSchemas,
  completeTreatmentBodySchema,
  consumableParamsSchema,
  consumableSchemas,
  consumableSortSchema,
  createAppointmentBodySchema,
  createPublicAppointmentBodySchema,
  clinicSlugParamsSchema,
  publicAvailabilityQuerySchema,
  publicBookingSchemas,
  listAppointmentsQuerySchema,
  rescheduleAppointmentBodySchema,
  createClinicalRecordBodySchema,
  createConsumableBodySchema,
  createPatientBodySchema,
  createInstallmentsBodySchema,
  createPaymentBodySchema,
  createProcedureBodySchema,
  createQuoteBodySchema,
  createTreatmentPlanBodySchema,
  createSupplierBodySchema,
  listConsumablesQuerySchema,
  listMovementsQuerySchema,
  listPatientsQuerySchema,
  listProceduresQuerySchema,
  listEventsQuerySchema,
  listEventsResponseSchema,
  listQuerySchema,
  listSuppliersQuerySchema,
  loginBodySchema,
  objectIdSchema,
  chartParamsSchema,
  chartToothParamsSchema,
  dentitionSchema,
  odontogramSchemas,
  patchDentitionBodySchema,
  patchToothBodySchema,
  patchTreatmentPlanBodySchema,
  paymentParamsSchema,
  patchPatientAllergiesBodySchema,
  patchPatientRiskTagsBodySchema,
  patientParamsSchema,
  patientSchemas,
  patientSortSchema,
  paymentSchemas,
  previewDeductionBodySchema,
  procedureParamsSchema,
  procedureSchemas,
  listPurchaseOrdersQuerySchema,
  patchPurchaseOrderBodySchema,
  purchaseOrderParamsSchema,
  purchaseOrderSchemas,
  receivePurchaseOrderBodySchema,
  registerClinicBodySchema,
  revenueQuerySchema,
  supplierParamsSchema,
  supplierSchemas,
  treatmentPlanParamsSchema,
  treatmentPlanSchemas,
  attachmentMimeSchema,
  attachmentParamsSchema,
  presignAttachmentBodySchema,
  drugParamsSchema,
  listDrugsQuerySchema,
  upsertDrugBodySchema,
  createPrescriptionBodySchema,
  prescriptionParamsSchema,
  prescriptionPdfQuerySchema,
  updateAppointmentBodySchema,
  updateConsumableBodySchema,
  updatePatientBodySchema,
  updateProcedureBodySchema,
  updateSupplierBodySchema,
} from "./schemas/index.js";
export type {
  AdjustStockBody,
  ConsumableSort,
  CreateAppointmentBody,
  CreatePublicAppointmentBody,
  ListAppointmentsQuery,
  RescheduleAppointmentBody,
  CompleteTreatmentBody,
  CreateClinicalRecordBody,
  CreateConsumableBody,
  CreatePatientBody,
  CreateInstallmentsBody,
  CreatePaymentBody,
  CreateProcedureBody,
  CreateQuoteBody,
  CreateTreatmentPlanBody,
  CreateSupplierBody,
  ListEventsQuery,
  ListEventsResponse,
  ListConsumablesQuery,
  ListMovementsQuery,
  ListPatientsQuery,
  ListProceduresQuery,
  ListSuppliersQuery,
  LoginBody,
  PatchDentitionBody,
  PatchPatientAllergiesBody,
  PatchToothBody,
  PatchPatientRiskTagsBody,
  PatchTreatmentPlanBody,
  PatientSort,
  PreviewDeductionBody,
  RegisterClinicBody,
  RevenueQuery,
  UpdateAppointmentBody,
  AttachmentMime,
  PresignAttachmentBody,
  RecordedPaymentMethod,
  ListDrugsQuery,
  UpsertDrugBody,
  CreatePrescriptionBody,
  PrescriptionPdfFormat,
  UpdateConsumableBody,
  UpdatePatientBody,
  UpdateProcedureBody,
  UpdateSupplierBody,
  ListPurchaseOrdersQuery,
  PatchPurchaseOrderBody,
  ReceivePurchaseOrderBody,
} from "./schemas/index.js";

export { CLINIC_SLUG_PATTERN, RESERVED_CLINIC_SLUGS } from "./clinic-slug.js";

export {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from "./locale/constants.js";
export { amountInWords } from "./locale/amount-words.js";
export { formatDA, formatDate, formatTime } from "./locale/format.js";
export { algiersIsoDay } from "./locale/algiers.js";
export {
  formatNational,
  isValidDzMobile,
  normalizeToE164,
  phoneSearchDigits,
} from "./locale/phone.js";
export {
  WILAYA_COUNT,
  WILAYA_LIST_VERSION,
  WILAYA_TRANSITION_ENDS,
  WILAYAS,
  wilayaByCode,
} from "./locale/wilayas.js";
export type { Wilaya } from "./locale/wilayas.js";

export {
  appointmentStatusLabels,
  dentitionLabels,
  paymentMethodLabels,
  recordedPaymentMethodLabels,
  riskTagLabels,
  roleLabels,
  stockMovementReasonLabels,
  stockStatusLabels,
  surfaceLabel,
  surfaceLabels,
  toothConditionLabels,
  treatmentStatusLabels,
  ordonnanceCopy,
  purchaseOrderCopy,
} from "./i18n/fr.js";

export {
  appointmentRealtimePayloadSchema,
  parseRealtimeEventPayload,
  realtimeEventPayloadSchemas,
  realtimeEventTypeSchema,
  realtimeEventTypes,
  stockLowPayloadSchema,
  stockUpdatedPayloadSchema,
} from "./realtime/events.js";
export type { RealtimeEventInput, RealtimeEventMap, RealtimeEventType } from "./realtime/events.js";

export { apiClientMessages, apiErrorCodes, apiErrorMessages } from "./i18n/api-errors.js";
export type { ApiErrorCode } from "./i18n/api-errors.js";
export { installFrenchZodErrorMap } from "./i18n/zod-fr.js";

export {
  generateDaySlots,
  isClinicClosedOnDate,
  nextAvailableSlots,
} from "./scheduling/availability.js";
export {
  isoDayInTimezone,
  timeOfDayInTimezone,
  utcFromZoned,
  weekdayInTimezone,
} from "./scheduling/timezone.js";
export type {
  AvailabilitySlot,
  BusyInterval,
  ClinicScheduleInput,
  DentistDayHours,
  DentistSchedule,
  DayHours,
  ScheduleHoliday,
  SeasonalHours,
  TimeSlot,
} from "./scheduling/types.js";

export {
  REMINDER_TEMPLATE_VERSION,
  renderReminderMessage,
  smsLikelyUcs2,
  smsSegmentCount,
} from "./reminders/templates.js";
export type { ReminderChannel, ReminderTemplateVars } from "./reminders/templates.js";

export { completedAgeYears, formatAgeFr } from "./clinical/age.js";
export { COMMON_DRUGS, catalogDrugById } from "./clinical/common-drugs.js";
export type { CatalogDrug } from "./clinical/common-drugs.js";
export { drugAllergyRules } from "./clinical/drug-allergy-rules.js";
export type { DrugAllergyRule } from "./clinical/drug-allergy-rules.js";
export { ATTACHMENT_MAX_BYTES, VERCEL_FUNCTION_BODY_BYTES } from "./clinical/limits.js";
export {
  foldClinicalText,
  matchPrescriptionWarnings,
  resolvedDrugDci,
} from "./clinical/drug-warnings.js";
export type { DrugWarning, WarningDrugItem, WarningPatient } from "./clinical/drug-warnings.js";
