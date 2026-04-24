import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SNS Hub - Dr.いわたつ",
    short_name: "SNS Hub",
    description: "Dr.いわたつのSNS運用ダッシュボード",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0d4a4a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
