import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  return [
    {
      url: new URL("/", appUrl).toString(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: new URL("/celo", appUrl).toString(),
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: new URL("/stacks", appUrl).toString(),
      changeFrequency: "daily",
      priority: 0.8
    }
  ];
}
