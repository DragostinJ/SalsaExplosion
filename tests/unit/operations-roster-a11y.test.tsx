import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CoachingRequestsTab } from "@/components/admin/operations/coaching-requests-tab";
import { MerchFulfillmentTab } from "@/components/admin/operations/merch-fulfillment-tab";
import { PartnerWaitlistTab } from "@/components/admin/operations/partner-waitlist-tab";
import { RosterDancerList } from "@/components/instructor/roster/roster-dancer-list";
import type { PrivateBookingItem, MerchItem, WaitlistItem } from "@/components/admin/operations/types";
import type { ClassRosterSummary } from "@/lib/constants/management";

describe("Operations & Roster Accessibility (A11y)", () => {
  it("renders CoachingRequestsTab with accessible aria-label on cancel action", () => {
    const mockBookings: PrivateBookingItem[] = [
      {
        id: "book-1",
        instructorName: "Enrique Perez Valdes",
        focusTopic: "Cuban Rumba styling",
        packageType: "1-HOUR",
        preferredSlot: "Saturday 3pm",
        totalPricePounds: 60,
        status: "CONFIRMED",
        createdAt: new Date(),
        student: {
          id: "stud-1",
          firstName: "Elena",
          lastName: "Perez",
          email: "elena@example.com",
        },
      },
    ];

    const html = renderToStaticMarkup(
      <CoachingRequestsTab
        privateBookings={mockBookings}
        pendingCoachingCount={0}
        isPending={false}
        onUpdateBooking={() => {}}
      />
    );

    expect(html).toContain('aria-label="Cancel coaching request"');
  });

  it("renders MerchFulfillmentTab with accessible aria-label on cancel action", () => {
    const mockMerch: MerchItem[] = [
      {
        id: "merch-1",
        itemId: "item-1",
        itemName: "Official Havana Clave T-Shirt",
        size: "L",
        pricePounds: 25,
        status: "RESERVED",
        createdAt: new Date(),
        user: {
          id: "u-1",
          firstName: "Carlos",
          lastName: "Santana",
          email: "carlos@example.com",
        },
      },
    ];

    const html = renderToStaticMarkup(
      <MerchFulfillmentTab
        merchReservations={mockMerch}
        pendingMerchCount={1}
        isPending={false}
        onUpdateMerch={() => {}}
      />
    );

    expect(html).toContain('aria-label="Cancel merchandise order"');
  });

  it("renders PartnerWaitlistTab with accessible aria-label on cancel action", () => {
    const mockWaitlist: WaitlistItem[] = [
      {
        id: "wait-1",
        role: "FOLLOW",
        status: "WAITING",
        partnerEmail: null,
        createdAt: new Date(),
        user: {
          id: "u-2",
          firstName: "Maria",
          lastName: "Garcia",
          email: "maria@example.com",
        },
      },
    ];

    const html = renderToStaticMarkup(
      <PartnerWaitlistTab
        waitlistEntries={mockWaitlist}
        waitingWaitlistCount={1}
        waitingLeadsCount={0}
        waitingFollowsCount={1}
        isPending={false}
        onAutoPairWaitlist={() => {}}
        onUpdateWaitlist={() => {}}
      />
    );

    expect(html).toContain('aria-label="Cancel waitlist entry"');
  });

  it("renders RosterDancerList with accessible clear-search button when query is present", () => {
    const mockClass: ClassRosterSummary = {
      id: "class-1",
      title: "Cuban Casino Fundamentals",
      room: "Main Hall",
      minLevel: "BEGINNER",
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      maxCapacity: 30,
      maxLeads: 15,
      maxFollows: 15,
      confirmedLeads: 10,
      confirmedFollows: 10,
      checkedInLeads: 0,
      checkedInFollows: 0,
      instructorName: "Enrique Perez Valdes",
      bookings: [],
    };

    const html = renderToStaticMarkup(
      <RosterDancerList
        activeClass={mockClass}
        filteredBookings={[]}
        awaitingBookings={[]}
        searchQuery="Elena"
        filterRole="ALL"
        isPending={false}
        onSearchChange={() => {}}
        onFilterChange={() => {}}
        onCheckInAllRemaining={() => {}}
        onToggleCheckIn={() => {}}
      />
    );

    expect(html).toContain('aria-label="Clear search"');
  });
});
