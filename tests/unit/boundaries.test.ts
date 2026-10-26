import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AdminErrorBoundary from "@/app/admin/error";
import InstructorErrorBoundary from "@/app/instructor/error";
import DashboardErrorBoundary from "@/app/dashboard/error";
import EventsErrorBoundary from "@/app/events/error";
import MusicErrorBoundary from "@/app/music/error";

describe("H4: Localized Route Error Boundaries", () => {
  it("renders AdminErrorBoundary with localized copy and retry button", () => {
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(AdminErrorBoundary, { error: new Error("DB Timeout"), reset })
    );

    expect(html).toContain("Operations Workspace Unavailable");
    expect(html).toContain("Retry Workspace");
    expect(html).toContain("/dashboard/schedule");
  });

  it("renders InstructorErrorBoundary with localized copy and reload button", () => {
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(InstructorErrorBoundary, { error: new Error("Network Error"), reset })
    );

    expect(html).toContain("Roster or Queue Offline");
    expect(html).toContain("Reload Roster");
  });

  it("renders DashboardErrorBoundary with localized copy and reload portal button", () => {
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(DashboardErrorBoundary, { error: new Error("Auth Expired"), reset })
    );

    expect(html).toContain("Unable to Load Dashboard");
    expect(html).toContain("Reload Portal");
  });

  it("renders EventsErrorBoundary with localized copy and retry button", () => {
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(EventsErrorBoundary, { error: new Error("Stripe Error"), reset })
    );

    expect(html).toContain("Could Not Load Festival Information");
    expect(html).toContain("Retry Events");
  });

  it("renders MusicErrorBoundary with localized copy and reload track button", () => {
    const reset = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(MusicErrorBoundary, { error: new Error("Audio Context Failed"), reset })
    );

    expect(html).toContain("Timba Engine Offline");
    expect(html).toContain("Reload Track");
  });
});
