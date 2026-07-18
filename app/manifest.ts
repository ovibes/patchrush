import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PatchRush: Choose Today's Arena",
    short_name: "PatchRush",
    description:
      "Preview today's PatchRush arena, compare Celo and Stacks, and jump into the live or demo network that fits your wallet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090b10",
    theme_color: "#090b10",
    lang: "en",
    dir: "ltr",
    categories: ["games", "entertainment", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
