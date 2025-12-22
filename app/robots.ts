import type { MetadataRoute } from "next"

/**
 * Generates robots.txt for search engine crawlers
 * Accessible at: https://hyperfolio.xyz/robots.txt
 * 
 * Includes:
 * - Standard crawler rules
 * - Sitemap reference
 * - LLMs.txt for AI crawlers (ChatGPT, Claude, etc.)
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
      // AI crawlers - allow access to llms.txt
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // @ts-expect-error - Next.js doesn't have official typing for host yet
    host: baseUrl,
  }
}

