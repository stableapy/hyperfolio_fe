import type { MetadataRoute } from "next"

/**
 * Generates sitemap.xml for search engine indexing
 * Accessible at: https://hyperfolio.xyz/sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hyperfolio.xyz"
  const currentDate = new Date()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
}

