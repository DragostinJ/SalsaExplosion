import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Salsa Explosion Bournemouth",
    short_name: "Salsa Explosion",
    description: "Bournemouth's Premier Cuban Salsa & Rueda de Casino Academy directed by Enrique Perez Valdes.",
    start_url: "/dashboard/schedule",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#E11D48",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
