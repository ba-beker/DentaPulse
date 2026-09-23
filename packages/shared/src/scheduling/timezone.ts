type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const value = parts.find((part) => part.type === type)?.value;
  if (value === undefined) {
    throw new RangeError(`Missing ${type} in zoned date parts`);
  }
  return Number(value);
}

function zonedParts(date: Date, timeZone: string): ZonedParts {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid date");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  let hour = readPart(parts, "hour");
  if (hour === 24) hour = 0;

  const weekdayToken = parts.find((part) => part.type === "weekday")?.value ?? "";
  const weekday = weekdayFromToken(weekdayToken);

  return {
    year: readPart(parts, "year"),
    month: readPart(parts, "month"),
    day: readPart(parts, "day"),
    hour,
    minute: readPart(parts, "minute"),
    weekday,
  };
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function weekdayFromToken(token: string): number {
  const value = WEEKDAY_INDEX[token];
  if (value === undefined) {
    throw new RangeError(`Unknown weekday token: ${token}`);
  }
  return value;
}

export function isoDayInTimezone(date: Date, timeZone: string): string {
  const { year, month, day } = zonedParts(date, timeZone);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function weekdayInTimezone(date: Date, timeZone: string): number {
  return zonedParts(date, timeZone).weekday;
}

export function timeOfDayInTimezone(date: Date, timeZone: string): string {
  const { hour, minute } = zonedParts(date, timeZone);
  return `${pad2(hour)}:${pad2(minute)}`;
}

function localWallUtcMs(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

/** Converts a wall-clock instant in `timeZone` to UTC. */
export function utcFromZoned(isoDay: string, timeOfDay: string, timeZone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeOfDay);
  if (!match || !timeMatch) {
    throw new RangeError("Invalid zoned date or time");
  }

  const target = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };

  let guess = localWallUtcMs(target);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const parts = zonedParts(new Date(guess), timeZone);
    if (
      parts.year === target.year &&
      parts.month === target.month &&
      parts.day === target.day &&
      parts.hour === target.hour &&
      parts.minute === target.minute
    ) {
      return new Date(guess);
    }
    guess += localWallUtcMs(target) - localWallUtcMs(parts);
  }

  throw new RangeError(`Could not resolve UTC for ${isoDay} ${timeOfDay} in ${timeZone}`);
}
