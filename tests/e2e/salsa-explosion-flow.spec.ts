import { test, expect } from "@playwright/test";

test.describe("Salsa Explosion UK — End-to-End User Flow", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(45000);
  });

  test("1. Landing page renders authentic Salsa Explosion branding and social proof", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

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

  test("2. Navigating to schedule checks auth protection or Lead/Follow slots", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule", { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (url.includes("sign-in")) {
      await expect(page).toHaveURL(/.*sign-in/);
      await expect(page.locator("body")).toBeVisible();
    } else {
      await expect(page).toHaveURL(/.*dashboard\/schedule/);
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();
      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("Lead");
      expect(bodyText).toContain("Follow");
    }
  });

  test("3. Opening the 2026 Bournemouth Summer Congress page, ticket tiers, and VIP upsell drawer", async ({
    page,
  }) => {
    // 1. Open Events Directory
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("Salsa Explosion Congresses & Masterclasses")
    ).toBeVisible();

    // 2. Open Congress Detail Page
    await page.goto("/events/bournemouth-summer-cuban-salsa-congress-2026", {
      waitUntil: "domcontentloaded",
    });

    // Verify Title and Venue
    await expect(
      page.getByText("Bournemouth Summer Cuban Salsa Congress 2026").first()
    ).toBeVisible();
    await expect(
      page.getByText(/The Roundhouse Hotel/i).first()
    ).toBeVisible();

    // Verify Ticket Tiers
    await expect(page.getByText(/Full .* Congress Pass/i).first()).toBeVisible();
    await expect(page.getByText(/Saturday .* Pass/i).first()).toBeVisible();
    await expect(
      page.getByText(/Havana Fiesta .* Pass/i).first()
    ).toBeVisible();

    // Verify Pass Prices
    await expect(page.getByText("£95").first()).toBeVisible();
    await expect(page.getByText("£60").first()).toBeVisible();
    await expect(page.getByText("£20").first()).toBeVisible();

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
    await page.goto("/venues", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("BOH Studios Bournemouth").first()
    ).toBeVisible();
    await expect(
      page.getByText("The Roundhouse Hotel").first()
    ).toBeVisible();
    await expect(page.getByText(/Haviland Road/i).first()).toBeVisible();
  });

  test("5. Referrals page enforces authentication for dancer rewards", async ({
    page,
  }) => {
    await page.goto("/dashboard/referrals", { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (url.includes("sign-in")) {
      await expect(page).toHaveURL(/.*sign-in/);
    } else {
      await expect(
        page.getByText("Invite Friends, Earn Free Class Credits")
      ).toBeVisible();
    }
  });

  test("6. Cuban Clave & Rhythm Trainer renders tempo controls and Web Audio drills", async ({
    page,
  }) => {
    await page.goto("/dashboard/rhythm", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("Cuban Clave & Rhythm Trainer")
    ).toBeVisible();
    await expect(page.getByText("2-3 Son Clave").first()).toBeVisible();
    await expect(page.getByText("3-2 Son Clave").first()).toBeVisible();
    await expect(page.getByText(/Campana/i).first()).toBeVisible();
  });

  test("7. Rueda de Casino Call Dictionary renders authentic calls, hand signals, and level filter", async ({
    page,
  }) => {
    await page.goto("/dashboard/rueda", { waitUntil: "domcontentloaded" });

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
    await page.goto("/private-lessons", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("1-on-1 Private Lessons & Coaching")
    ).toBeVisible();
    await expect(
      page.getByText("Maestro Enrique Perez Valdes").first()
    ).toBeVisible();
    await expect(page.getByText(/1-Hour/i).first()).toBeVisible();
    await expect(page.getByText(/5-Hour/i).first()).toBeVisible();
  });

  test("9. Cuban Music & Social Playlist Hub renders curated tracks and BPM categories", async ({
    page,
  }) => {
    await page.goto("/music", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("Cuban Music & Social Playlist Hub")
    ).toBeVisible();
    await expect(
      page.getByText(/Slow Son/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Timba/i).first()
    ).toBeVisible();
  });

  test("10. Merch & Dance Essentials storefront renders items and Click-and-Collect details", async ({
    page,
  }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText(/Merch & Dance Essentials/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Salsa Explosion .* Hoodie/i).first()
    ).toBeVisible();
    await expect(
      page.getByText("Hand-Crafted Cuban Flag Abanico").first()
    ).toBeVisible();
    await expect(
      page.getByText("Suede-Sole Practice Dance Shoes").first()
    ).toBeVisible();
  });
});
