import {
  ACADEMY_METRICS,
  VENUE_INFO,
  WEEKLY_SCHEDULE,
  PASS_PRICING,
  UPCOMING_EVENTS,
  ACADEMY_FAQS,
} from "@/lib/academy-data";

export function JsonLdSchema() {
  const allSessions = [
    ...WEEKLY_SCHEDULE.thursday.sessions.map((s) => ({ ...s, dayName: "Thursday" })),
    ...WEEKLY_SCHEDULE.sunday.sessions.map((s) => ({ ...s, dayName: "Sunday" })),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["DanceGroup", "DanceSchool", "LocalBusiness"],
        "@id": "https://salsaexplosion.co.uk/#organization",
        name: "Salsa Explosion UK — Bournemouth Cuban Salsa Academy",
        description:
          "Bournemouth's authentic Cuban Salsa & Rueda de Casino academy directed by Maestro Enrique Perez Valdes. Strictly Thursdays and Sundays at BOH Studios Bournemouth. Drop-in welcome, no partner required.",
        url: "https://salsaexplosion.co.uk",
        telephone: VENUE_INFO.phoneE164,
        priceRange: "£12 - £14 (Weekly Classes at Door) | £12 - £95 (Festival Passes)",
        founder: {
          "@type": "Person",
          name: ACADEMY_METRICS.founderName,
          jobTitle: "Maestro & Artistic Director",
          award: ACADEMY_METRICS.founderAward,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: `BOH Studios, ${VENUE_INFO.streetAddress}`,
          addressLocality: VENUE_INFO.city,
          postalCode: VENUE_INFO.postcode,
          addressCountry: VENUE_INFO.country,
        },
        areaServed: [
          "Bournemouth",
          "Boscombe",
          "Poole",
          "Christchurch",
          "Dorset",
        ],
        knowsAbout: [
          "Cuban Salsa",
          "Casino",
          "Rueda de Casino",
          "Son Cubano",
          "Timba",
          "Bachata",
          "Kizomba",
          "Latin Dance Classes",
        ],
        sameAs: [VENUE_INFO.instagramUrl, VENUE_INFO.facebookUrl],
      },
      ...allSessions.map((session) => ({
        "@type": "Course",
        "@id": `https://salsaexplosion.co.uk/#course-${session.id}`,
        name: `${session.dayName} ${session.time} — ${session.title}`,
        description: `${session.level} (${session.badge}) directed by ${session.instructor} at ${VENUE_INFO.name}, ${VENUE_INFO.fullAddress}.`,
        provider: {
          "@id": "https://salsaexplosion.co.uk/#organization",
        },
        offers: {
          "@type": "Offer",
          price: PASS_PRICING.PACK_SINGLE.priceInPounds.toFixed(2),
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: "https://salsaexplosion.co.uk/dashboard/schedule",
        },
      })),
      ...UPCOMING_EVENTS.map((evt) => ({
        "@type": "Event",
        "@id": `https://salsaexplosion.co.uk/events/${evt.slug}`,
        name: evt.title,
        startDate: evt.startDateIso,
        ...(evt.endDateIso ? { endDate: evt.endDateIso } : {}),
        description: evt.description,
        location: {
          "@type": "Place",
          name: evt.venueName,
          address: {
            "@type": "PostalAddress",
            streetAddress: VENUE_INFO.streetAddress,
            addressLocality: VENUE_INFO.city,
            postalCode: VENUE_INFO.postcode,
            addressCountry: VENUE_INFO.country,
          },
        },
        offers: {
          "@type": "Offer",
          price: evt.minPricePounds.toFixed(2),
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: `https://salsaexplosion.co.uk/events/${evt.slug}`,
        },
        organizer: {
          "@type": "Organization",
          name: "Salsa Explosion UK",
          url: "https://salsaexplosion.co.uk",
        },
      })),
      {
        "@type": "FAQPage",
        "@id": "https://salsaexplosion.co.uk/#faq",
        mainEntity: ACADEMY_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
