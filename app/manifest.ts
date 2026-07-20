import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PatchRush Daily Territory Arena",
    short_name: "PatchRush",
    description:
      "PatchRush is a daily on-chain territory game for Celo and Stacks. Preview the board, compare wallet flows, and jump into the live or demo arena.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090b10",
    theme_color: "#090b10",
    lang: "en",
    dir: "ltr",
    categories: ["games", "entertainment", "social"],
    shortcuts: [
      {
        name: "Open Celo arena",
        short_name: "Celo arena",
        description: "Open the Celo PatchRush arena in live or demo mode.",
        url: "/celo"
      },
      {
        name: "Open Stacks arena",
        short_name: "Stacks arena",
        description: "Open the Stacks PatchRush arena in live or demo mode.",
        url: "/stacks"
      }
    ],
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
