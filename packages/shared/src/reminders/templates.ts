/** Reminder copy version — bump when WhatsApp templates change. */
export const REMINDER_TEMPLATE_VERSION = "2026-09-22" as const;

export type ReminderChannel = "sms" | "whatsapp" | "email";

export type ReminderTemplateVars = {
  patientName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  address: string;
};

const GSM7_BASIC =
  /^[\n\r @£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~]|€]*$/;

/** Rough GSM-7 check; accents outside GSM-7 force UCS-2 (70 chars per segment). */
export function smsLikelyUcs2(text: string): boolean {
  return !GSM7_BASIC.test(text);
}

export function smsSegmentCount(text: string): number {
  const ucs2 = smsLikelyUcs2(text);
  const single = ucs2 ? 70 : 160;
  const multi = ucs2 ? 67 : 153;
  if (text.length <= single) return 1;
  return Math.ceil(text.length / multi);
}

function formatVars(vars: ReminderTemplateVars): ReminderTemplateVars {
  return {
    patientName: vars.patientName.trim(),
    doctorName: vars.doctorName.trim(),
    clinicName: vars.clinicName.trim(),
    date: vars.date.trim(),
    time: vars.time.trim(),
    address: vars.address.trim(),
  };
}

/** Short SMS without accents when possible to stay in GSM-7. */
export function renderSmsReminder(kind: "24h" | "2h", vars: ReminderTemplateVars): string {
  const v = formatVars(vars);
  if (kind === "24h") {
    return `Rappel: RDV demain ${v.date} ${v.time} chez ${v.clinicName}. ${v.address}.`;
  }
  return `Rappel: RDV a ${v.time} chez ${v.clinicName}. ${v.address}.`;
}

/** WhatsApp Business template body (fixed wording; variables mapped by position). */
export function renderWhatsAppReminder(kind: "24h" | "2h", vars: ReminderTemplateVars): string {
  const v = formatVars(vars);
  if (kind === "24h") {
    return `Bonjour {{1}}, votre rendez-vous chez {{2}} avec {{3}} est prévu le {{4}} à {{5}}. Adresse : {{6}}.`
      .replace("{{1}}", v.patientName)
      .replace("{{2}}", v.clinicName)
      .replace("{{3}}", v.doctorName)
      .replace("{{4}}", v.date)
      .replace("{{5}}", v.time)
      .replace("{{6}}", v.address);
  }
  return `Bonjour {{1}}, rappel : rendez-vous aujourd'hui à {{2}} chez {{3}} ({{4}}).`
    .replace("{{1}}", v.patientName)
    .replace("{{2}}", v.time)
    .replace("{{3}}", v.clinicName)
    .replace("{{4}}", v.address);
}

export function renderEmailReminder(kind: "24h" | "2h", vars: ReminderTemplateVars): string {
  const v = formatVars(vars);
  if (kind === "24h") {
    return `Bonjour ${v.patientName},\n\nNous vous rappelons votre rendez-vous demain (${v.date}) à ${v.time} avec ${v.doctorName} au ${v.clinicName}.\n\nAdresse : ${v.address}\n\nCordialement,\n${v.clinicName}`;
  }
  return `Bonjour ${v.patientName},\n\nVotre rendez-vous est prévu aujourd'hui à ${v.time} au ${v.clinicName} (${v.address}).\n\nÀ tout à l'heure,\n${v.clinicName}`;
}

export function renderReminderMessage(
  channel: ReminderChannel,
  kind: "24h" | "2h",
  vars: ReminderTemplateVars,
): string {
  switch (channel) {
    case "sms":
      return renderSmsReminder(kind, vars);
    case "whatsapp":
      return renderWhatsAppReminder(kind, vars);
    case "email":
      return renderEmailReminder(kind, vars);
    default: {
      const _exhaustive: never = channel;
      return _exhaustive;
    }
  }
}
