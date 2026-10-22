export function JsonLdSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["DanceSchool", "LocalBusiness"],
        "@id": "https://salsaexplosion.co.uk/#organization",
        name: "Salsa Explosion UK — Bournemouth Cuban Salsa Academy",
        description:
          "Bournemouth's authentic Cuban Salsa academy directed by Maestro Enrique Perez Valdes. Weekly partnerwork, Rueda de Casino, and congress passes at BOH Studios.",
        url: "https://salsaexplosion.co.uk",
        telephone: "+447969633701",
        founder: {
          "@type": "Person",
          name: "Enrique Perez Valdes",
          jobTitle: "Maestro & Founder",
          award: "Salsa UK Lifetime Achievement Award",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "BOH Studios, 104 Commercial Rd",
          addressLocality: "Bournemouth",
          postalCode: "BH2 5LR",
          addressCountry: "GB",
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
        sameAs: [
          "https://www.instagram.com/salsaexplosion/",
          "https://www.facebook.com/salsaexplosion",
        ],
      },
      {
        "@type": "Event",
        "@id": "https://salsaexplosion.co.uk/events/halloween-fancy-dress-latin-party-2026",
        name: "Halloween Fancy Dress Party",
        startDate: "2026-10-31T19:30:00Z",
        location: {
          "@type": "Place",
          name: "BOH Studios Bournemouth",
          address: {
            "@type": "PostalAddress",
            streetAddress: "104 Commercial Rd",
            addressLocality: "Bournemouth",
            postalCode: "BH2 5LR",
            addressCountry: "GB",
          },
        },
        offers: {
          "@type": "Offer",
          price: "12.00",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: "https://salsaexplosion.co.uk/events/halloween-fancy-dress-latin-party-2026",
        },
        organizer: {
          "@type": "Organization",
          name: "Salsa Explosion UK",
          url: "https://salsaexplosion.co.uk",
        },
      },
      {
        "@type": "Event",
        "@id": "https://salsaexplosion.co.uk/events/sbk-night-extravaganza-2026",
        name: "SB&K Night Extravaganza",
        startDate: "2026-11-14T19:30:00Z",
        location: {
          "@type": "Place",
          name: "BOH Studios Bournemouth",
          address: {
            "@type": "PostalAddress",
            streetAddress: "104 Commercial Rd",
            addressLocality: "Bournemouth",
            postalCode: "BH2 5LR",
            addressCountry: "GB",
          },
        },
        offers: {
          "@type": "Offer",
          price: "15.00",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: "https://salsaexplosion.co.uk/events/sbk-night-extravaganza-2026",
        },
        organizer: {
          "@type": "Organization",
          name: "Salsa Explosion UK",
          url: "https://salsaexplosion.co.uk",
        },
      },
      {
        "@type": "Event",
        "@id": "https://salsaexplosion.co.uk/events/made-in-cuba-dance-weekend-2026",
        name: "MADE IN CUBA — Dance Weekend 2026",
        startDate: "2026-12-04T18:00:00Z",
        endDate: "2026-12-06T23:00:00Z",
        location: {
          "@type": "Place",
          name: "BOH Studios Bournemouth",
          address: {
            "@type": "PostalAddress",
            streetAddress: "104 Commercial Rd",
            addressLocality: "Bournemouth",
            postalCode: "BH2 5LR",
            addressCountry: "GB",
          },
        },
        offers: {
          "@type": "Offer",
          price: "20.00",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: "https://salsaexplosion.co.uk/events/made-in-cuba-dance-weekend-2026",
        },
        organizer: {
          "@type": "Organization",
          name: "Salsa Explosion UK",
          url: "https://salsaexplosion.co.uk",
        },
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
