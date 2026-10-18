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
});
