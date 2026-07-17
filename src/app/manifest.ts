import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Layla — Web push notifications",
    short_name: "Layla",
    description:
      "Drop one line of JS on your site and send browser push notifications. No email, no trackers.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#5D0AD1",
    orientation: "portrait",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
