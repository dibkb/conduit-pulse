import { getJson } from "serpapi";
import z from "zod";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const redditSearchResultSchema = z.object({
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
});

export async function searchReddit(title: string): Promise<SearchResult[]> {
  try {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY is not set in environment variables");
    }

    const results = await getJson({
      api_key: apiKey,
      engine: "google",
      q: title,
      as_sitesearch: "reddit.com",
      num: 10,
    });

    return results["organic_results"].map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }));
  } catch (error) {
    console.error("Error searching Reddit:", error);
    throw error;
  }
}
