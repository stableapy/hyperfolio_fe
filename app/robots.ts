import type { MetadataRoute } from "next"

/**
 * Generates robots.txt for search engine crawlers
 * Accessible at: https://hyperfolio.xyz/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://hyperfolio.xyz"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // Disallow API routes from being indexed
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

