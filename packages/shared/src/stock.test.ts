import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_EXPIRY_ALERT_DAYS,
  EXPIRING_SOON_DAYS,
  percentOfMin,
  stockStatus,
} from "./stock.js";

const TODAY = new Date("2026-09-21T12:00:00+01:00");

describe("stockStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("classifies quantity when there is no expiration date", () => {
    expect(stockStatus(10, 5, null)).toBe("in_stock");
    expect(stockStatus(6, 5, null)).toBe("in_stock");
    expect(stockStatus(5, 5, null)).toBe("low");
    expect(stockStatus(1, 5, null)).toBe("low");
    expect(stockStatus(0, 5, null)).toBe("out");
    expect(stockStatus(0, 0, null)).toBe("out");
    expect(stockStatus(-1, 5, null)).toBe("out");
  });

  it("applies expiration precedence around the 60-day window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
    expect(DEFAULT_EXPIRY_ALERT_DAYS).toBe(60);
    expect(EXPIRING_SOON_DAYS).toBe(60);

    expect(stockStatus(10, 2, new Date("2026-09-20T12:00:00+01:00"))).toBe("expired");
    expect(stockStatus(0, 2, new Date("2026-09-20T22:30:00Z"))).toBe("expired");
    expect(stockStatus(10, 2, new Date("2026-09-21T00:00:00+01:00"))).toBe("expiring_soon");
    expect(stockStatus(10, 2, new Date("2026-09-20T23:30:00Z"))).toBe("expiring_soon");
    expect(stockStatus(1, 5, new Date("2026-11-20T12:00:00+01:00"))).toBe("expiring_soon");
    expect(stockStatus(10, 2, new Date("2026-11-21T12:00:00+01:00"))).toBe("in_stock");
    expect(stockStatus(2, 5, new Date("2026-11-21T12:00:00+01:00"))).toBe("low");
    expect(stockStatus(0, 5, new Date("2026-10-01T12:00:00+01:00"))).toBe("out");
    expect(stockStatus(0, 5, new Date("2026-09-21T23:30:00+01:00"))).toBe("out");
  });

  it("honours a clinic-specific expiry window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
    expect(stockStatus(10, 2, new Date("2026-10-21T12:00:00+01:00"), 30)).toBe("expiring_soon");
    expect(stockStatus(10, 2, new Date("2026-10-22T12:00:00+01:00"), 30)).toBe("in_stock");
  });

  it("rejects quantities and dates that cannot be classified", () => {
    expect(() => stockStatus(Number.NaN, 1, null)).toThrow(RangeError);
    expect(() => stockStatus(1, Number.POSITIVE_INFINITY, null)).toThrow(RangeError);
    expect(() => stockStatus(1, 1, new Date("not-a-date"))).toThrow(RangeError);
  });
});

describe("percentOfMin", () => {
  it("expresses remaining stock against the alert threshold", () => {
    expect(percentOfMin(10, 5)).toBe(200);
    expect(percentOfMin(5, 5)).toBe(100);
    expect(percentOfMin(1, 5)).toBe(20);
    expect(percentOfMin(0, 5)).toBe(0);
    expect(percentOfMin(3, 0)).toBe(100);
    expect(percentOfMin(0, 0)).toBe(0);
  });
});
