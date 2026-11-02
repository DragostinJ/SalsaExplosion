import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Salsa Explosion Bournemouth",
    short_name: "Salsa Explosion",
    description: "Bournemouth's Premier Cuban Salsa & Rueda de Casino Academy directed by Enrique Perez Valdes.",
    start_url: "/classes",
    display: "standalone",
    background_color: "#F1E6D0",
    theme_color: "#E8462F",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
