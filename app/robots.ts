import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  return {
    host: appUrl.origin,
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: new URL("/sitemap.xml", appUrl).toString()
  };
}
