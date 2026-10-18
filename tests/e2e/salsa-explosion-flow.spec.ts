import { test, expect } from "@playwright/test";

test.describe("Salsa Explosion UK — End-to-End User Flow", () => {
  test("1. Landing page renders authentic Salsa Explosion branding and social proof", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Verify Brand Title & Director Heading
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toContainText("Bournemouth");
    await expect(heroHeading).toContainText("Enrique Perez Valdes");

    // 2. Verify Lifetime Achievement Award & BOH Studios badges
    await expect(
      page.getByText("Salsa UK Lifetime Achievement Award Winner")
    ).toBeVisible();
    await expect(
      page.getByText("Home Hub: BOH Studios Bournemouth")
    ).toBeVisible();

    // 3. Verify Community Social Proof
    await expect(page.getByText("4,200+ Dancers in Community")).toBeVisible();
    await expect(page.getByText("25+ Years Cuban Salsa Heritage")).toBeVisible();

    // 4. Verify Social Media Links to @salsaexplosion & Facebook Community
    const instagramLinks = page.locator('a[href*="instagram.com/salsaexplosion"]');
    await expect(instagramLinks.first()).toBeVisible();

    const facebookLinks = page.locator(
      'a[href*="facebook.com/groups/salsaexplosionuk"]'
    );
    await expect(facebookLinks.first()).toBeVisible();

    // 5. Verify Social Proof Grid Section
    await expect(
      page.getByText("Feel the Energy of Bournemouth's Cuban Community")
    ).toBeVisible();
    await expect(
      page.getByText("Friday Night Rueda de Casino at BOH Studios")
    ).toBeVisible();
    await expect(page.getByText("Mark Townsend")).toBeVisible();
  });

  test("2. Navigating to schedule and checking Lead/Follow slots", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule");

    // Check schedule page loads cleanly
    await expect(page).toHaveURL(/.*dashboard\/schedule/);

    // Verify timetable header or class calendar elements
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Check for Lead/Follow dance roles and capacity indicators
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("Lead");
    expect(bodyText).toContain("Follow");
  });

  test("3. Opening the 2026 Bournemouth Summer Congress page, ticket tiers, and VIP upsell drawer", async ({
    page,
  }) => {
    // 1. Open Events Directory
    await page.goto("/events");
    await expect(
      page.getByText("Salsa Explosion Congresses & Masterclasses")
    ).toBeVisible();

    // 2. Open Congress Detail Page
    await page.goto("/events/bournemouth-summer-cuban-salsa-congress-2026");

    // Verify Title and Venue
    await expect(
      page.getByText("Bournemouth Summer Cuban Salsa Congress 2026").first()
    ).toBeVisible();
    await expect(
      page.getByText("The Roundhouse Hotel & BOH Studios, Bournemouth").first()
    ).toBeVisible();

    // Verify Ticket Tiers
    await expect(page.getByText("Full Congress Pass")).toBeVisible();
    await expect(page.getByText("Saturday Bootcamp & Social Pass")).toBeVisible();
    await expect(
      page.getByText("Havana Fiesta Saturday Night Pass")
    ).toBeVisible();

    // Verify Pass Prices
    await expect(page.getByText("£95")).toBeVisible();
    await expect(page.getByText("£60")).toBeVisible();
    await expect(page.getByText("£20")).toBeVisible();

    // 3. Test VIP Upsell Drawer Trigger
    const bookFullPassBtn = page
      .locator("button", { hasText: /Book as Lead|Get Full Congress Pass/i })
      .first();

    if (await bookFullPassBtn.isVisible()) {
      await bookFullPassBtn.click();

      // Verify the VIP Upsell Modal opens
      await expect(
        page.getByText("Upgrade Your Bournemouth Congress Pass")
      ).toBeVisible();
      await expect(
        page.getByText("Official 2026 Congress T-Shirt")
      ).toBeVisible();
      await expect(
        page.getByText("Maestro Private Masterclass")
      ).toBeVisible();
    }
  });

  test("4. Venues directory renders BOH Studios Bournemouth and Roundhouse Hotel", async ({
    page,
  }) => {
    await page.goto("/venues");

    await expect(
      page.getByText("BOH Studios Bournemouth")
    ).toBeVisible();
    await expect(
      page.getByText("The Roundhouse Hotel Bournemouth")
    ).toBeVisible();
    await expect(page.getByText("12-14 Post Office Rd")).toBeVisible();
  });

  test("5. Referrals page renders referral invite links and credit rewards", async ({
    page,
  }) => {
    await page.goto("/dashboard/referrals");

    await expect(
      page.getByText("Invite Friends, Earn Free Class Credits")
    ).toBeVisible();
    await expect(
      page.getByText("Your Personal Dancer Invite Link")
    ).toBeVisible();
  });

  test("6. Cuban Clave & Rhythm Trainer renders tempo controls and Web Audio drills", async ({
    page,
  }) => {
    await page.goto("/dashboard/rhythm");

    await expect(
      page.getByText("Cuban Clave & Rhythm Trainer")
    ).toBeVisible();
    await expect(page.getByText("2-3 Son Clave")).toBeVisible();
    await expect(page.getByText("3-2 Son Clave")).toBeVisible();
    await expect(page.getByText("Campana (Cowbell)")).toBeVisible();
  });

  test("7. Rueda de Casino Call Dictionary renders authentic calls, hand signals, and level filter", async ({
    page,
  }) => {
    await page.goto("/dashboard/rueda");

    await expect(
      page.getByText("Rueda de Casino Call Dictionary")
    ).toBeVisible();
    await expect(page.getByText("Guapea").first()).toBeVisible();
    await expect(page.getByText("Dame").first()).toBeVisible();
    await expect(page.getByText("Enchufla").first()).toBeVisible();
  });

  test("8. 1-on-1 Private Lessons page renders instructors and coaching packages", async ({
    page,
  }) => {
    await page.goto("/private-lessons");

    await expect(
      page.getByText("1-on-1 Private Lessons & Coaching")
    ).toBeVisible();
    await expect(
      page.getByText("Maestro Enrique Perez Valdes")
    ).toBeVisible();
    await expect(page.getByText("1-Hour Single Session")).toBeVisible();
    await expect(page.getByText("5-Hour Intensive Block")).toBeVisible();
  });

  test("9. Cuban Music & Social Playlist Hub renders curated tracks and BPM categories", async ({
    page,
  }) => {
    await page.goto("/music");

    await expect(
      page.getByText("Cuban Music & Social Playlist Hub")
    ).toBeVisible();
    await expect(
      page.getByText("Slow Cuban Son (80-90 BPM)")
    ).toBeVisible();
    await expect(
      page.getByText("High-Energy Timba & Reparto (105+ BPM)")
    ).toBeVisible();
  });

  test("10. Merch & Dance Essentials storefront renders items and Click-and-Collect details", async ({
    page,
  }) => {
    await page.goto("/shop");

    await expect(
      page.getByText("Salsa Explosion Merch & Dance Essentials")
    ).toBeVisible();
    await expect(
      page.getByText("Salsa Explosion Full-Zip Hoodie")
    ).toBeVisible();
    await expect(
      page.getByText("Hand-Crafted Cuban Flag Abanico")
    ).toBeVisible();
    await expect(
      page.getByText("Suede-Sole Practice Dance Shoes")
    ).toBeVisible();
  });
});

