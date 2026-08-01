import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PatchRush Daily Territory Game",
    short_name: "PatchRush",
    description:
      "PatchRush is a daily on-chain territory game for Celo and Stacks. Preview the board, compare today's arenas, and choose live play or the daily demo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#090b10",
    theme_color: "#090b10",
    lang: "en",
    dir: "ltr",
    categories: ["games", "entertainment", "social"],
    screenshots: [
      {
        src: "/og.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "PatchRush landing page with board preview and arena chooser"
      }
    ],
    shortcuts: [
      {
        name: "Choose today's arena",
        short_name: "Choose Arena",
        description: "Preview today's PatchRush board, compare networks, and choose a live or demo arena.",
        url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      },
      {
        name: "Open today's Celo arena",
        short_name: "Celo Arena",
        description: "Launch today's Celo PatchRush arena for live play or the daily demo.",
        url: "/celo",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      },
      {
        name: "Open today's Stacks arena",
        short_name: "Stacks Arena",
        description: "Launch today's Stacks PatchRush arena for live play or the daily demo.",
        url: "/stacks",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      }
    ],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
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
