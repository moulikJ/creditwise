import type { MetadataRoute } from "next";
import { cardRepo, articleRepo } from "@/lib/repo";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = [{ url: "/" }, { url: "/explore" }, { url: "/compare" }, { url: "/recommend" }, { url: "/learn" }];
  const cards = cardRepo.all().map((c) => ({ url: `/card/${c.slug}` }));
  const articles = articleRepo.all().map((a) => ({ url: `/learn/${a.slug}` }));
  return [...base, ...cards, ...articles] as MetadataRoute.Sitemap;
}
