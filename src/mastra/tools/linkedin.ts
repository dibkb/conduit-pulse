import { createTool } from "@mastra/core/tools";
import axios from "axios";
import z from "zod";

export const linkedInProfileTool = createTool({
  id: "LinkedInProfileEnrichment",
  inputSchema: z.object({
    url: z.string(),
  }),
  description: `Enrich and extract detailed information from a LinkedIn profile using its URL. Uses Scrapin API to fetch comprehensive profile data including work experience, education, and skills.`,
  execute: async ({ context: { url } }) => {
    const results = await axios.get(
      `https://api.scrapin.io/enrichment/profile?apikey=${process.env.SCRAPIN_API_KEY}`,
      {
        params: {
          linkedInUrl: url,
        },
      }
    );
    return { results: results.data };
  },
});

export const linkedInSearchTool = createTool({
  id: "LinkedInContactSearch",
  inputSchema: z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    companyName: z.string().nullable(),
    email: z.string().nullable(),
  }),
  description: `Search and find LinkedIn profiles using various identifiers like name, company, or email. Returns matching profile information using Scrapin API's enrichment capabilities.`,
  execute: async ({ context: { firstName, lastName, companyName, email } }) => {
    console.log("searchToolLinkedInProfiles.execute");
    try {
      const results = await axios.get(
        `https://api.scrapin.io/enrichment?apikey=${process.env.SCRAPIN_API_KEY}`,
        {
          params: Object.fromEntries(
            Object.entries({
              firstName,
              lastName,
              companyName,
              email,
            }).filter(([, value]) => value != null)
          ),
        }
      );
      return { results: results.data };
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
