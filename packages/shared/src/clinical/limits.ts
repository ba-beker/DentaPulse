/**
 * Vercel Functions reject a request or response body above 4.5 MB.
 * Confirmed against the limitations page (updated 9 February 2026):
 * https://vercel.com/docs/functions/limitations
 *
 * Radiographs and photos are larger than that, so the browser uploads them
 * straight to object storage. Only this JSON metadata hits the function.
 */
export const VERCEL_FUNCTION_BODY_BYTES = 4_500_000;

/** Direct-to-storage cap. Independent of the function body limit above. */
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;
