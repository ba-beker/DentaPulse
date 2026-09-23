import { describe, expect, it } from "vitest";
import { ATTACHMENT_MAX_BYTES, VERCEL_FUNCTION_BODY_BYTES } from "../clinical/limits.js";
import { presignAttachmentBodySchema } from "./attachment.js";

describe("attachment presign schema", () => {
  it("accepts a radiograph larger than the Vercel function body, because it never goes through it", () => {
    expect(ATTACHMENT_MAX_BYTES).toBeGreaterThan(VERCEL_FUNCTION_BODY_BYTES);
    const parsed = presignAttachmentBodySchema.safeParse({
      fileName: "radio panoramique.jpg",
      mime: "image/jpeg",
      size: 5_000_000,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a renamed executable and a mime that does not match the extension", () => {
    expect(
      presignAttachmentBodySchema.safeParse({
        fileName: "photo.exe",
        mime: "image/jpeg",
        size: 120,
      }).success,
    ).toBe(false);
    expect(
      presignAttachmentBodySchema.safeParse({
        fileName: "photo.jpg",
        mime: "application/pdf",
        size: 120,
      }).success,
    ).toBe(false);
    expect(
      presignAttachmentBodySchema.safeParse({
        fileName: "photo.jpg",
        mime: "image/jpeg",
        size: ATTACHMENT_MAX_BYTES + 1,
      }).success,
    ).toBe(false);
  });
});
