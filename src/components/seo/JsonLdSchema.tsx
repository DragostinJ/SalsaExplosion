import { getSiteOrigin } from "@/lib/safe-url";
import {
  ACADEMY_METRICS,
  VENUE_INFO,
  WEEKLY_SCHEDULE,
  upcomingCanonicalEvents,
  ACADEMY_FAQS,
} from "@/lib/academy-data";
import {
  buildWeeklyClassCourseJsonLd,
  buildFestivalEventJsonLd,
} from "@/lib/seo/event-jsonld";

export function JsonLdSchema() {
  const allSessions = [
    ...WEEKLY_SCHEDULE.thursday.sessions.map((s) => ({ ...s, dayName: "Thursday" })),
    ...WEEKLY_SCHEDULE.sunday.sessions.map((s) => ({ ...s, dayName: "Sunday" })),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Real schema.org types only: "DanceSchool" does not exist (schema.org/DanceSchool is a 404),
        // and PerformingArtsTheater means a theatre building; the school rents studios at BOH Studios.
        "@type": ["LocalBusiness", "EducationalOrganization"],
        "@id": `${getSiteOrigin()}/#organization`,
        name: "Salsa Explosion UK — Cuban Salsa & Rueda de Casino Bournemouth",
        alternateName: "Salsa Explosion UK — Bournemouth Cuban Salsa Academy",
        description:
          "Bournemouth's authentic Cuban Salsa & Rueda de Casino academy directed by Maestro Enrique Perez Valdes. Strictly Thursdays and Sundays at BOH Studios Bournemouth. Drop-in welcome, no partner required.",
        url: getSiteOrigin(),
        telephone: VENUE_INFO.phoneE164,
        priceRange: "£12 - £14",
        founder: {
          "@type": "Person",
          name: "Maestro Enrique Perez Valdes",
          jobTitle: "Maestro & Artistic Director",
          award: ACADEMY_METRICS.founderAward,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "104 Commercial Rd, The Triangle",
          addressLocality: VENUE_INFO.city,
          postalCode: "BH2 5LR",
          addressCountry: "GB",
        },
        containedInPlace: {
          "@type": "Place",
          name: "BOH Studios Bournemouth",
          address: {
            "@type": "PostalAddress",
            streetAddress: "104 Commercial Rd, The Triangle",
            addressLocality: "Bournemouth",
            postalCode: "BH2 5LR",
            addressCountry: "GB",
          },
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 50.7208,
          longitude: -1.8845,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Thursday"],
            opens: "18:45",
            closes: "23:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Sunday"],
            opens: "18:15",
            closes: "22:30",
          },
        ],
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
      ...allSessions.map((session) => buildWeeklyClassCourseJsonLd(session)),
      ...upcomingCanonicalEvents().map((evt) =>
        buildFestivalEventJsonLd({
          slug: evt.slug,
          title: evt.title,
          description: evt.description,
          startDate: evt.startDateIso,
          endDate: evt.endDateIso,
          coverImageUrl: evt.posterUrl,
          venueName: evt.venueName,
          minPricePounds: evt.minPricePounds,
        })
      ),
      {
        "@type": "FAQPage",
        "@id": `${getSiteOrigin()}/#faq`,
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
