import type { MetadataRoute } from "next";
import { brand } from "@/content/brand";
import { articles, kbCategories } from "@/content/knowledge-base";
import { legalPages } from "@/content/legal";
import { products } from "@/content/products";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = brand.url;

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/data-protection", priority: 0.9 },
    { path: "/hosting", priority: 0.9 },
    { path: "/domains", priority: 0.9 },
    { path: "/shop", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/quote", priority: 0.8 },
    { path: "/support", priority: 0.7 },
    { path: "/knowledge-base", priority: 0.7 },
    { path: "/careers", priority: 0.5 },
    { path: "/login", priority: 0.4 },
    { path: "/register", priority: 0.4 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...kbCategories.map((c) => ({
      url: `${base}/knowledge-base/category/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...articles.map((a) => ({
      url: `${base}/knowledge-base/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...legalPages.map((p) => ({
      url: `${base}/legal/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
