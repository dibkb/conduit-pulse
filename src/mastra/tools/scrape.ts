import { createTool } from "@mastra/core/tools";
import axios from "axios";
import z from "zod";

export const scrapePageTool = createTool({
  id: "WebPageScraper",
  inputSchema: z.object({
    url: z.string(),
  }),
  description: `Scrape and extract content from any web page using ScrapeOwl API. Returns the full HTML content and metadata of the specified URL.`,
  execute: async ({ context: { url } }) => {
    console.log("scrapePageTool.execute");
    try {
      const results = await axios.post(`https://api.scrapeowl.com/v1/scrape`, {
        api_key: process.env.SCRAPEOWL_API_KEY,
        url: url,
      });
      return {
        error: false,
        results: results.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: true,
          message: error.response?.data?.message || error.message,
          status: error.response?.status,
          results: null,
        };
      }
      return {
        error: true,
        message: "An unexpected error occurred",
        results: null,
      };
    }
  },
});
