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

    // 2. Verify Lifetime Achievement Award & BOH Studios residency
    await expect(
      page.getByText("Directed by Salsa UK Lifetime Achievement Award winner Maestro Enrique Perez Valdes")
    ).toBeVisible();
    await expect(
      page.getByText("BOH Studios Bournemouth Residency")
    ).toBeVisible();

    // 3. Verify Community Social Proof
    await expect(page.getByText("4,200+").first()).toBeVisible();
    await expect(page.getByText("25+ Years").first()).toBeVisible();

    // 4. Verify Social Media Links to @salsaexplosion & Facebook Community
    const instagramLinks = page.locator('a[href*="instagram.com/salsaexplosion"]');
    await expect(instagramLinks.first()).toBeVisible();

    const facebookLinks = page.locator(
      'a[href*="facebook.com/salsaexplosion"]'
    );
    await expect(facebookLinks.first()).toBeVisible();

    // 5. Verify Social Proof Grid Section
    await expect(
      page.getByText("Feel the Energy of Bournemouth's Cuban Community")
    ).toBeVisible();
    await expect(
      page.getByText("Thursday Night Rueda de Casino at BOH Studios")
    ).toBeVisible();
    await expect(page.getByText("Mark Townsend")).toBeVisible();

    // 6. Verify Interactive Level Finder Quiz
    await expect(page.getByText("Interactive Level Finder • 15 Seconds")).toBeVisible();
    await expect(page.getByText("Not Sure Which Cuban Salsa Level to Book?")).toBeVisible();
    await expect(page.getByText("I've never danced Cuban Salsa before")).toBeVisible();
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

  test("3. Opening the Made in Cuba Weekend page, ticket tiers, and VIP upsell drawer", async ({
    page,
  }) => {
    // 1. Open Events Directory
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("Salsa Explosion Congresses & Masterclasses")
    ).toBeVisible();

    // 2. Open Congress/Weekend Festival Detail Page
    await page.goto("/events/made-in-cuba-dance-weekend-2026", {
      waitUntil: "networkidle",
    });

    // Verify Title and Venue
    await expect(
      page.getByText("MADE IN CUBA — Dance Weekend 2026").first()
    ).toBeVisible();
    await expect(
      page.getByText(/BOH Studios Bournemouth/i).first()
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

  test("4. Venues directory renders BOH Studios Bournemouth, Woodlands Ballroom, Neptune Hall, and Roundhouse Hotel", async ({
    page,
  }) => {
    await page.goto("/venues", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("BOH Studios Bournemouth").first()
    ).toBeVisible();
    await expect(
      page.getByText("The Woodlands Ballroom").first()
    ).toBeVisible();
    await expect(
      page.getByText("Neptune Hall").first()
    ).toBeVisible();
    await expect(
      page.getByText("The Roundhouse Hotel").first()
    ).toBeVisible();
    await expect(page.getByText(/Commercial Road/i).first()).toBeVisible();
    await expect(page.getByText(/Ashley Road/i).first()).toBeVisible();
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

  test("6. About page renders Maestro Enrique Perez Valdes heritage, Moe Flex, and authentic faculty", async ({
    page,
  }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("Bournemouth's Cuban Rhythm.")
    ).toBeVisible();
    await expect(
      page.getByText(/Enrique Perez Valdes/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Moe Flex/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/General of MCs/i).first()
    ).toBeVisible();
    await expect(page.getByText(/Dragostin/i)).toHaveCount(0);
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

  test("10. Shop route redirects cleanly to pricing and gift vouchers showcase", async ({
    page,
  }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/pricing/);
    await expect(
      page.getByText("DANCE VOUCHERS — THE PERFECT GIFT!").first()
    ).toBeVisible();
    await expect(page.getByText("Official Gift Certificate").first()).toBeVisible();
  });

  test("11. Venues & Parking guide renders interactive arrival planner and navigation links", async ({
    page,
  }) => {
    await page.goto("/venues", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText(/Door-to-Door Arrival Planner/i).first()
    ).toBeVisible();
    await expect(page.getByText(/BOH Studios/i).first()).toBeVisible();
    await expect(page.getByText(/The Woodlands Ballroom/i).first()).toBeVisible();
    await expect(page.getByText(/Neptune Hall/i).first()).toBeVisible();
    await expect(page.getByText(/59200/i).first()).toBeVisible();
    await expect(page.getByText(/The Roundhouse Hotel/i).first()).toBeVisible();
    await expect(page.getByText(/Nearby Hotels for Dance Weekends/i).first()).toBeVisible();
    await expect(page.getByText(/Late-Night Studio Safety/i).first()).toBeVisible();
    await expect(page.getByText(/Studio Desk Hotline/i).first()).toBeVisible();
  });

  test("12. PWA manifest, robots.txt, and sitemap.xml routes return HTTP 200", async ({
    request,
  }) => {
    const manifestRes = await request.get("/manifest.webmanifest");
    expect(manifestRes.status()).toBe(200);
    const manifestJson = await manifestRes.json();
    expect(manifestJson.name).toBe("Salsa Explosion Bournemouth");

    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain("sitemap.xml");

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
  });

  test("13. Student Digital Wallet and Passes hub (/dashboard/wallet) route integrity", async ({
    page,
  }) => {
    await page.goto("/dashboard/wallet", { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (url.includes("sign-in")) {
      await expect(page).toHaveURL(/.*sign-in/);
    } else {
      await expect(page).toHaveURL(/.*dashboard\/wallet/);
      await expect(page.getByText(/Digital Passes/i)).toBeVisible();
    }
  });

  test("14. Studio Desk Operations hub (/admin/operations) route integrity", async ({
    page,
  }) => {
    await page.goto("/admin/operations", { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (url.includes("sign-in") || url.includes("schedule")) {
      expect(url).toMatch(/sign-in|schedule/);
    } else {
      await expect(page).toHaveURL(/.*admin\/operations/);
      await expect(page.getByText(/Studio Desk Operations/i)).toBeVisible();
    }
  });

  test("15. Halloween Fancy Dress Latin Party renders costume prizes, timetable, and poster", async ({
    page,
  }) => {
    await page.goto("/events/halloween-fancy-dress-latin-party-2026", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByText("HALLOWEEN FANCY DRESS PARTY").first()
    ).toBeVisible();
    await expect(page.getByText(/Best Costume Prizes/i).first()).toBeVisible();
    await expect(page.getByText("1 Made in Cuba Weekend Pass")).toBeVisible();
    await expect(page.getByText("2 Free Dance Classes", { exact: true })).toBeVisible();
    await expect(page.getByText("Alex Spindlove").first()).toBeVisible();
    await expect(
      page.locator('img[alt="Halloween Latin Party Poster"]')
    ).toBeVisible();
  });

  test("16. Weekly recurring schedule calendar overview renders Thursdays and Sundays at BOH Studios", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule", { waitUntil: "domcontentloaded" });

    const url = page.url();
    if (!url.includes("sign-in")) {
      await expect(
        page.getByText("Weekly Class Calendar").first()
      ).toBeVisible();
      await expect(page.getByText(/BOH Studios Bournemouth Weekly Schedule/i).first()).toBeVisible();
      await expect(page.getByText("Flagship Thursday Night")).toBeVisible();
      await expect(page.getByText("Every Sunday Evening")).toBeVisible();
      await expect(page.getByText("BOH Studios Bournemouth").first()).toBeVisible();
      await expect(page.getByText("Moe Flex").first()).toBeVisible();
    }
  });

  test("17. Dance Vouchers showcase renders authentic gift benefits and phone order CTA", async ({
    page,
  }) => {
    // 1. Check Homepage
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("DANCE VOUCHERS — THE PERFECT GIFT!").first()
    ).toBeVisible();
    await expect(page.getByText("ORDER NOW: 07969 633701").first()).toBeVisible();
    await expect(page.getByText("🎂 Birthday presents").first()).toBeVisible();

    // 2. Check Pricing page
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("DANCE VOUCHERS — THE PERFECT GIFT!").first()
    ).toBeVisible();

    // 3. Check Shop page
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("DANCE VOUCHERS — THE PERFECT GIFT!").first()
    ).toBeVisible();
    await expect(page.getByText("Official Gift Certificate").first()).toBeVisible();
  });

  test("18. Private Lessons page renders authentic teachers Moe Flex, Justyna, Arturas, Jim, and Enrique", async ({
    page,
  }) => {
    await page.goto("/private-lessons", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Moe Flex").first()).toBeVisible();
    await expect(page.getByText("General of MCs").first()).toBeVisible();
    await expect(page.getByText("Justyna").first()).toBeVisible();
    await expect(page.getByText("Arturas").first()).toBeVisible();
    await expect(page.getByText("Jim").first()).toBeVisible();
    await expect(page.getByText("Enrique Perez Valdes").first()).toBeVisible();
  });

  test("19. High-contrast Instagram and Facebook community buttons render with correct brand gradients and links", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const igButton = page.locator('a[href="https://www.instagram.com/salsaexplosion/"]').first();
    const fbButton = page.locator('a[href="https://www.facebook.com/salsaexplosion"]').first();
    await expect(igButton).toBeVisible();
    await expect(fbButton).toBeVisible();
  });

  test("20. Zero-cost health check endpoint /api/health returns HTTP 200 and healthy status", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(data.tier).toBe("bootstrap-zero-cost");
  });

  test("21. Terms & UK Legal Hub (/terms) renders statutory consumer rights, 14-day cooling-off, and GDPR notice", async ({
    page,
  }) => {
    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Terms of Service, Consumer Rights/i).first()).toBeVisible();
    await expect(page.getByText(/14-Day Statutory Cooling-Off Period/i).first()).toBeVisible();
    await expect(page.getByText(/UK GDPR & Data Protection Act 2018/i).first()).toBeVisible();
    await expect(page.getByText(/104 Commercial Road/i).first()).toBeVisible();
  });

  test("22. Class schedule renders Multi-Age Fast-Track and 60+ Senior reassurance banners", async ({
    page,
  }) => {
    await page.goto("/dashboard/schedule", { waitUntil: "domcontentloaded" });
    const banner = page.locator('[data-testid="multi-age-ux-banner"]');
    await expect(banner).toBeVisible();
    await expect(page.getByText("15-Second Quick Guide").first()).toBeVisible();
    await expect(page.getByText("Prefer Not to Use Apps or QR Codes?").first()).toBeVisible();
  });

  test("23. How It Works renders Teacher and Door Staff Operations guide for Enrique and faculty", async ({
    page,
  }) => {
    await page.goto("/how-it-works", { waitUntil: "domcontentloaded" });
    const staffGuide = page.locator('[data-testid="staff-operations-guide"]');
    await expect(staffGuide).toBeVisible();
    await expect(page.getByText("How Teachers & Door Staff Run Class Check-In").first()).toBeVisible();
    await expect(page.getByText("Self-Serve Door QR").first()).toBeVisible();
    await expect(page.getByText("Live Camera Scanner").first()).toBeVisible();
  });

  test("24. Instructor Trading Cards and BOH Studios Venue Spotlight render and interact", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // 1. Verify Instructor Roster Section presence
    const rosterSection = page.locator('[data-testid="instructor-roster-section"]');
    await expect(rosterSection).toBeVisible();
    await expect(page.getByText("Meet the Salsa Explosion Faculty")).toBeVisible();

    // 2. Verify all filter pills exist
    await expect(page.getByRole("button", { name: /All Artists/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Weekly Cuban Team/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Afro-Rumba & Timba/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /BOH Venue Partner/i })).toBeVisible();

    // 3. Verify instructor cards (e.g. Moe Flex, Enrique, Arturas)
    await expect(page.locator('[data-testid="instructor-card-enrique"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-card-moe-flex"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-card-arturas"]')).toBeVisible();

    // 4. Open instructor profile modal for Moe Flex
    const moeCard = page.locator('[data-testid="instructor-card-moe-flex"]');
    await moeCard.getByRole("button", { name: /View Profile & Bookings/i }).click();

    const modal = page.locator('[data-testid="instructor-spotlight-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Moe Flex")).toBeVisible();
    await expect(modal.getByText(/Book 1-on-1 Private via WhatsApp/i)).toBeVisible();

    // Close modal via Close button
    await modal.getByRole("button", { name: /Close spotlight modal/i }).click();
    await expect(modal).not.toBeVisible();

    // 5. Verify BOH Studios Venue Spotlight
    const venueSection = page.locator('[data-testid="boh-venue-spotlight"]');
    await expect(venueSection).toBeVisible();
    await expect(page.getByText("Hosted at BOH Studios Bournemouth")).toBeVisible();

    // Verify arrival planner tabs switch
    await page.getByRole("button", { name: /Bus & Train/i }).click();
    await expect(page.getByText("Bournemouth Square & Poole Hill Bus Stops")).toBeVisible();

    await page.getByRole("button", { name: /First-Timer Door Guide/i }).click();
    await expect(page.getByText(/104 Commercial Road \(The Triangle\)/i)).toBeVisible();

    // Verify Google Maps external link
    const mapsLink = venueSection.locator('a[href*="google.com/maps"]');
    await expect(mapsLink).toBeVisible();
  });

  test("25. Pre-pitch competitor kill-shot features (live banner, why cuban comparison, crossover quiz, and mobile roster toggle)", async ({
    page,
  }) => {
    // 1. Visit landing page with Thursday live demo so banner renders on any day of week
    await page.goto("/?liveDemo=thursday");
    await page.waitForLoadState("domcontentloaded");

    // 2. Verify Live Tonight Banner
    const liveBanner = page.locator('[data-testid="live-tonight-banner"]');
    await expect(liveBanner).toBeVisible();
    await expect(
      liveBanner.getByText(/CLASSES LIVE TONIGHT AT BOH STUDIOS|Live Tonight at BOH Studios/i)
    ).toBeVisible();

    // 3. Verify Why Cuban Casino Section
    const whyCuban = page.locator('[data-testid="why-cuban-section"]');
    await expect(whyCuban).toBeVisible();
    await expect(
      whyCuban.getByRole("heading", { name: /What Makes Cuban Casino & Rueda So Addictive/i })
    ).toBeVisible();
    await expect(whyCuban.getByText(/The Magic of the Rueda Circle/i)).toBeVisible();
    await expect(whyCuban.getByText(/Pure Havana Rhythm, Timba & Afro-Rumba/i)).toBeVisible();

    // 4. Verify Cross-Over Dancer Option in Level Matcher Quiz
    const crossoverBtn = page.getByRole("button", {
      name: /I Dance Other Styles/i,
    });
    await expect(crossoverBtn).toBeVisible();
    await crossoverBtn.click();

    // Verify Crossover recommendation card appears
    await expect(
      page.getByRole("heading", { name: /Expand Your Dance Horizons/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Explore the Timetable & Book Your Session/i })
    ).toBeVisible();

    // 5. Verify Mobile Expand Toggle on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileToggle = page.getByRole("button", {
      name: /Show All 8 Maestros & Guest Artists/i,
    });
    await expect(mobileToggle).toBeVisible();
    await mobileToggle.click();
    await expect(
      page.getByRole("button", { name: /Show Fewer Artists/i })
    ).toBeVisible();
  });
});


