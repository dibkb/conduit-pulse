import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const searchTool = createTool({
  id: "WebSearch",
  inputSchema: z.object({
    query: z.string(),
  }),
  description: `Search the web using SerpAPI to find relevant information and results. Returns organic search results including titles, links, and snippets.`,
  execute: async ({ context: { query } }) => {
    try {
      if (!process.env.SERPAPI_API_KEY) {
        throw new Error("SERPAPI_API_KEY is not configured");
      }

      const results = await axios.get(
        `https://serpapi.com/search?q=${query}&api_key=${process.env.SERPAPI_API_KEY}`
      );

      if (!results.data || !results.data.organic_results) {
        throw new Error("Invalid response format from SerpAPI");
      }

      return {
        success: true,
        data: results.data.organic_results,
        error: null,
      };
    } catch (error) {
      console.error("Search tool error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
});
