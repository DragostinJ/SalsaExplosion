import { describe, it, expect, beforeEach } from "vitest";
import {
  verifyImageMagicBytes,
  sanitizeExtractedString,
  sanitizeSafeEventUrl,
  checkAiRateLimit,
  resetAiRateLimitStore,
} from "@/lib/security/upload-and-ai-guard";
import {
  FlyerAndPostImportInputSchema,
  ParsedEventCardSchema,
} from "@/lib/validations/ai-studio.schema";
import {
  parseFacebookPostToEventAction,
  approveAndPublishEventAction,
  removePublishedEventAction,
  getLivePublishedEventsAction,
} from "@/actions/ai-studio.actions";
import { clearPublishedEvents } from "@/lib/stores/published-events-store";

describe("Multimodal Flyer Upload & AI Vision Defense-in-Depth Security Suite", () => {
  beforeEach(() => {
    resetAiRateLimitStore();
    clearPublishedEvents();
  });

  describe("1. Magic-Byte Binary Signature Verification", () => {
    it("rejects malicious SVG / HTML or small payload masquerading as an image", () => {
      // Fake SVG payload '<svg onload=alert(1)>'
      const svgBuffer = new TextEncoder().encode("<svg onload=alert(1)>");
      const result = verifyImageMagicBytes(svgBuffer);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Security violation");
    });

    it("rejects payload smaller than 12 bytes", () => {
      const tinyBuffer = new Uint8Array([0xff, 0xd8, 0xff]);
      const result = verifyImageMagicBytes(tinyBuffer);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("too small");
    });

    it("accepts authentic JPEG magic bytes (0xFF, 0xD8, 0xFF)", () => {
      const jpegHeader = new Uint8Array([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      const result = verifyImageMagicBytes(jpegHeader);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe("image/jpeg");
    });

    it("accepts authentic PNG magic bytes", () => {
      const pngHeader = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      const result = verifyImageMagicBytes(pngHeader);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe("image/png");
    });

    it("accepts authentic WebP magic bytes (RIFF .... WEBP)", () => {
      const webpHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      const result = verifyImageMagicBytes(webpHeader);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe("image/webp");
    });
  });

  describe("2. XSS & Prompt-Injection Output Sanitization", () => {
    it("strips HTML tags and script injections from extracted strings", () => {
      const dirty = "<script>alert('pwned')</script>Havana Nights <img src=x onerror=alert(1)>";
      const clean = sanitizeExtractedString(dirty);

      expect(clean).toBe("alert('pwned')Havana Nights");
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("<img");
    });

    it("sanitizes event CTA URLs, rejecting javascript: and evil phishing domains", () => {
      expect(sanitizeSafeEventUrl("javascript:alert(1)")).toBe("/events");
      expect(sanitizeSafeEventUrl("data:text/html,<script>alert(1)</script>")).toBe("/events");
      expect(sanitizeSafeEventUrl("https://evil-phishing-tickets.com/checkout")).toBe("/events");

      // Allows valid relative path
      expect(sanitizeSafeEventUrl("/events/halloween-party-2026")).toBe(
        "/events/halloween-party-2026"
      );

      // Allows official ticketing partners
      expect(sanitizeSafeEventUrl("https://www.fatsoma.com/e/salsa-bournemouth")).toBe(
        "https://www.fatsoma.com/e/salsa-bournemouth"
      );
      expect(
        sanitizeSafeEventUrl("https://salsaexplosion.co.uk/events/made-in-cuba-2026")
      ).toBe("https://salsaexplosion.co.uk/events/made-in-cuba-2026");
    });
  });

  describe("3. Rate Limiter Security", () => {
    it("enforces sliding-window rate limit (10 requests per window)", () => {
      const id = "test-user-ip-123";
      for (let i = 0; i < 10; i++) {
        const check = checkAiRateLimit(id, 10, 60);
        expect(check.allowed).toBe(true);
      }

      // 11th request should be blocked
      const blocked = checkAiRateLimit(id, 10, 60);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("4. End-to-End Human-in-the-Loop Event Approval & Publishing", () => {
    it("parses event with valid flyer fallback and publishes to live store", async () => {
      // Valid minimal JPEG base64 (12 bytes)
      const validJpegBase64 =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";

      const parseRes = await parseFacebookPostToEventAction({
        flyerImageBase64: validJpegBase64,
        flyerMimeType: "image/jpeg",
        rawFacebookText: "HALLOWEEN SALSA FIESTA at BOH Studios with Maestro Enrique!",
      });

      expect(parseRes.success).toBe(true);
      expect(parseRes.data).toBeDefined();

      const extracted = parseRes.data!;
      expect(extracted.venue).toContain("BOH Studios");

      // Approve & publish
      const publishRes = await approveAndPublishEventAction(extracted);
      expect(publishRes.success).toBe(true);
      expect(publishRes.data?.totalLiveEvents).toBeGreaterThanOrEqual(1);

      // Verify live events retrieval
      const liveRes = await getLivePublishedEventsAction();
      expect(liveRes.success).toBe(true);
      expect(liveRes.data?.some((e) => e.id === extracted.id)).toBe(true);

      // Remove / unpublish
      const removeRes = await removePublishedEventAction(extracted.id);
      expect(removeRes.success).toBe(true);

      const afterRemove = await getLivePublishedEventsAction();
      expect(afterRemove.data?.some((e) => e.id === extracted.id)).toBe(false);
    });

    it("rejects parseFacebookPostToEventAction when image magic bytes are spoofed", async () => {
      // Fake base64 representing '<svg onload=alert(1)>'
      const fakeSvgBase64 = Buffer.from("<svg onload=alert(1)>").toString("base64");

      const parseRes = await parseFacebookPostToEventAction({
        flyerImageBase64: fakeSvgBase64,
        flyerMimeType: "image/jpeg",
      });

      expect(parseRes.success).toBe(false);
      expect(parseRes.error).toContain("Security violation");
    });
  });
});
