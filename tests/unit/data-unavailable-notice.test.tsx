import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";

describe("M2: DataUnavailableNotice Component", () => {
  it("renders default data-unavailable notice with correct role and testid", () => {
    const html = renderToString(<DataUnavailableNotice />);
    expect(html).toContain('data-testid="data-unavailable-notice"');
    expect(html).toContain('role="status"');
    expect(html).toContain("We couldn&#x27;t load your latest data");
    expect(html).toContain("Your passes and bookings are safe");
    expect(html).toContain("Reload");
  });

  it("renders custom title and description when provided", () => {
    const html = renderToString(
      <DataUnavailableNotice
        title="Schedule Sync Warning"
        description="Unable to sync class reservations right now."
      />
    );
    expect(html).toContain("Schedule Sync Warning");
    expect(html).toContain("Unable to sync class reservations right now.");
  });
});
