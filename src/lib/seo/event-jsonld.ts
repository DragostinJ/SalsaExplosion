import { getSiteOrigin } from "@/lib/safe-url";
import { VENUE_INFO } from "@/lib/academy-data";

export interface EventJsonLdLocation {
  "@type": "Place";
  name: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface EventJsonLdOffer {
  "@type": "Offer";
  name?: string;
  price: string;
  priceCurrency: "GBP";
  availability: string;
  url?: string;
  description?: string;
}

export interface EventJsonLd {
  "@context": "https://schema.org";
  "@type": "Event";
  "@id"?: string;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  image?: string;
  location: EventJsonLdLocation;
  performer?: {
    "@type": "Person";
    name: string;
    jobTitle?: string;
  };
  organizer: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  offers: EventJsonLdOffer | EventJsonLdOffer[];
}

export interface ClassCourseJsonLd {
  "@type": "Course";
  "@id": string;
  name: string;
  description: string;
  provider: {
    "@id": string;
  };
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: "GBP";
    description: string;
    availability: string;
  };
}

export function buildFestivalEventJsonLd(params: {
  slug: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  coverImageUrl?: string | null;
  venueName?: string;
  venueAddress?: string;
  ticketTiers?: Array<{
    name: string;
    priceInCents: number;
  }>;
  minPricePounds?: number;
  isFinished?: boolean;
  performer?: {
    name: string;
    jobTitle?: string;
  };
}): EventJsonLd {
  const startIso =
    typeof params.startDate === "string"
      ? params.startDate
      : params.startDate.toISOString();
  const endIso = params.endDate
    ? typeof params.endDate === "string"
      ? params.endDate
      : params.endDate.toISOString()
    : undefined;

  const fullImageUrl = params.coverImageUrl
    ? params.coverImageUrl.startsWith("http")
      ? params.coverImageUrl
      : `${getSiteOrigin()}${params.coverImageUrl}`
    : undefined;

  const availability = params.isFinished
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";

  let offers: EventJsonLdOffer | EventJsonLdOffer[];
  if (params.ticketTiers && params.ticketTiers.length > 0) {
    offers = params.ticketTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: (tier.priceInCents / 100).toFixed(2),
      priceCurrency: "GBP",
      availability,
      url: `${getSiteOrigin()}/events/${params.slug}`,
    }));
  } else {
    offers = {
      "@type": "Offer",
      price: (params.minPricePounds ?? 0).toFixed(2),
      priceCurrency: "GBP",
      availability,
      url: `${getSiteOrigin()}/events/${params.slug}`,
    };
  }

  const performer = params.performer
    ? {
        "@type": "Person" as const,
        name: params.performer.name,
        ...(params.performer.jobTitle ? { jobTitle: params.performer.jobTitle } : {}),
      }
    : {
        "@type": "Person" as const,
        name: "Enrique Perez Valdes",
        jobTitle: "Artistic Director",
      };

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${getSiteOrigin()}/events/${params.slug}`,
    name: params.title,
    startDate: startIso,
    ...(endIso ? { endDate: endIso } : {}),
    ...(params.description ? { description: params.description } : {}),
    ...(fullImageUrl ? { image: fullImageUrl } : {}),
    location: {
      "@type": "Place",
      name: params.venueName || VENUE_INFO.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: params.venueAddress || VENUE_INFO.streetAddress,
        addressLocality: VENUE_INFO.city,
        postalCode: VENUE_INFO.postcode,
        addressCountry: VENUE_INFO.country,
      },
    },
    performer,
    organizer: {
      "@type": "Organization",
      name: "Salsa Explosion UK",
      url: getSiteOrigin(),
    },
    offers,
  };
}

export function buildWeeklyClassCourseJsonLd(session: {
  id: string;
  dayName: string;
  time: string;
  title: string;
  level: string;
  badge: string;
  instructor: string;
}): ClassCourseJsonLd {
  return {
    "@type": "Course",
    "@id": `${getSiteOrigin()}/#course-${session.id}`,
    name: `${session.dayName} ${session.time} — ${session.title}`,
    description: `${session.level} (${session.badge}) directed by ${session.instructor} at ${VENUE_INFO.name}, ${VENUE_INFO.fullAddress}.`,
    provider: {
      "@id": `${getSiteOrigin()}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "12.00",
      priceCurrency: "GBP",
      description:
        "Pay at the door (£12 for 1 class / £14 for 2 classes). Cash or card accepted at the door. No online pre-booking required.",
      availability: "https://schema.org/InStoreOnly",
    },
  };
}
