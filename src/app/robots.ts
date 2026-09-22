import type { MetadataRoute } from "next";
import { brand } from "@/content/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The portal and checkout are private or session-specific.
      disallow: ["/portal", "/checkout", "/cart", "/login", "/register"],
    },
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
