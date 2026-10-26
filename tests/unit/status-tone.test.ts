import { describe, it, expect } from "vitest";
import {
  bookingStatusTone,
  merchStatusTone,
  waitlistStatusTone,
  coachingStatusTone,
  sentimentTone,
} from "@/lib/status-tone";

describe("Semantic Status Tone Mapping (Milestone Q1)", () => {
  describe("bookingStatusTone", () => {
    it("maps confirmed, attended, paid to success", () => {
      expect(bookingStatusTone("ATTENDED")).toBe("success");
      expect(bookingStatusTone("CONFIRMED")).toBe("success");
      expect(bookingStatusTone("PAID")).toBe("success");
    });

    it("maps waitlisted and pending to warning", () => {
      expect(bookingStatusTone("WAITLISTED")).toBe("warning");
      expect(bookingStatusTone("PENDING")).toBe("warning");
    });

    it("maps cancelled, no_show, refunded to danger", () => {
      expect(bookingStatusTone("CANCELLED")).toBe("danger");
      expect(bookingStatusTone("CANCELED")).toBe("danger");
      expect(bookingStatusTone("NO_SHOW")).toBe("danger");
      expect(bookingStatusTone("REFUNDED")).toBe("danger");
    });

    it("maps completed to info", () => {
      expect(bookingStatusTone("COMPLETED")).toBe("info");
    });

    it("maps unknown or null to neutral", () => {
      expect(bookingStatusTone("UNKNOWN_VAL")).toBe("neutral");
      expect(bookingStatusTone(null)).toBe("neutral");
      expect(bookingStatusTone(undefined)).toBe("neutral");
    });
  });

  describe("merchStatusTone", () => {
    it("maps collected to success", () => {
      expect(merchStatusTone("COLLECTED")).toBe("success");
    });

    it("maps reserved to warning", () => {
      expect(merchStatusTone("RESERVED")).toBe("warning");
    });

    it("maps cancelled to danger", () => {
      expect(merchStatusTone("CANCELLED")).toBe("danger");
      expect(merchStatusTone("CANCELED")).toBe("danger");
    });

    it("maps unknown to neutral", () => {
      expect(merchStatusTone("UNKNOWN")).toBe("neutral");
      expect(merchStatusTone(null)).toBe("neutral");
    });
  });

  describe("waitlistStatusTone", () => {
    it("maps paired to success and notified to info", () => {
      expect(waitlistStatusTone("PAIRED")).toBe("success");
      expect(waitlistStatusTone("NOTIFIED")).toBe("info");
    });

    it("maps waiting to warning", () => {
      expect(waitlistStatusTone("WAITING")).toBe("warning");
    });

    it("maps cancelled to danger", () => {
      expect(waitlistStatusTone("CANCELLED")).toBe("danger");
    });

    it("maps unknown to neutral", () => {
      expect(waitlistStatusTone("UNKNOWN")).toBe("neutral");
    });
  });

  describe("coachingStatusTone", () => {
    it("maps confirmed to success, completed to info, pending to warning, cancelled to danger", () => {
      expect(coachingStatusTone("CONFIRMED")).toBe("success");
      expect(coachingStatusTone("COMPLETED")).toBe("info");
      expect(coachingStatusTone("PENDING")).toBe("warning");
      expect(coachingStatusTone("CANCELLED")).toBe("danger");
    });

    it("maps unknown to neutral", () => {
      expect(coachingStatusTone("OTHER")).toBe("neutral");
    });
  });

  describe("sentimentTone", () => {
    it("maps loved it to success", () => {
      expect(sentimentTone("LOVED_IT")).toBe("success");
    });

    it("maps overwhelmed to danger", () => {
      expect(sentimentTone("A_BIT_OVERWHELMED")).toBe("danger");
    });

    it("maps pace fast/slow to warning", () => {
      expect(sentimentTone("PACE_WAS_FAST")).toBe("warning");
      expect(sentimentTone("PACE_WAS_SLOW")).toBe("warning");
    });

    it("maps unknown to neutral", () => {
      expect(sentimentTone("RANDOM_TEXT")).toBe("neutral");
      expect(sentimentTone(null)).toBe("neutral");
    });
  });
});
