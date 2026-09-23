import { describe, expect, it } from "vitest";
import { formatDA, formatDate, formatTime } from "./format.js";

describe("locale formatters", () => {
  it("formats dinars with a regular space and no decimals", () => {
    expect(formatDA(0)).toBe("0 DA");
    expect(formatDA(12)).toBe("12 DA");
    expect(formatDA(999)).toBe("999 DA");
    expect(formatDA(1_000)).toBe("1 000 DA");
    expect(formatDA(12_500)).toBe("12 500 DA");
    expect(formatDA(1_000_000)).toBe("1 000 000 DA");
    expect(formatDA(-12_500)).toBe("-12 500 DA");
    expect(formatDA(12_500).includes("\u202f")).toBe(false);
    expect(formatDA(12_500).includes("\u00a0")).toBe(false);
    expect(() => formatDA(12.5)).toThrow(RangeError);
    expect(() => formatDA(Number.NaN)).toThrow(RangeError);
  });

  it("formats dates as dd/MM/yyyy in Africa/Algiers", () => {
    expect(formatDate(new Date("2026-09-21T12:00:00+01:00"))).toBe("21/09/2026");
    expect(formatDate(new Date("2026-01-05T08:00:00+01:00"))).toBe("05/01/2026");
    expect(formatDate(new Date("2026-09-20T23:30:00Z"))).toBe("21/09/2026");
    expect(() => formatDate(new Date("not-a-date"))).toThrow(RangeError);
  });

  it("formats times on a 24-hour clock", () => {
    expect(formatTime(new Date("2026-09-21T14:30:00+01:00"))).toBe("14:30");
    expect(formatTime(new Date("2026-09-21T08:05:00+01:00"))).toBe("08:05");
    expect(formatTime(new Date("2026-09-20T23:00:00Z"))).toBe("00:00");
    expect(formatTime(new Date("2026-09-21T23:59:00+01:00"))).toBe("23:59");
  });
});
