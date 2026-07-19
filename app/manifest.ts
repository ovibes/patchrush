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
    shortcuts: [
      {
        name: "Open Celo arena",
        short_name: "Celo arena",
        description: "Jump straight to the Celo PatchRush arena.",
        url: "/celo"
      },
      {
        name: "Open Stacks arena",
        short_name: "Stacks arena",
        description: "Jump straight to the Stacks PatchRush arena.",
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
