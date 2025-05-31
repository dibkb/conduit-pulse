import { createTool } from "@mastra/core/tools";
import axios from "axios";
import z from "zod";

export const anymailEmailTool = createTool({
  id: "EmailFinderByDomain",
  inputSchema: z.object({
    domain: z.string(),
    name: z.string(),
  }),
  description: `Find a person's email address using their name and company domain. Uses Anymail API to search and verify email addresses based on company domain and full name.`,
  execute: async ({ context: { domain, name } }) => {
    const url = "https://api.anymailfinder.com/v5.0/search/person.json";
    try {
      if (!process.env.ANYMAIL_API_KEY) {
        throw new Error("ANYMAIL_API_KEY is not configured");
      }

      const response = await axios.post(
        url,
        { domain, name },
        {
          headers: {
            Authorization: `Bearer ${process.env.ANYMAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );
      if (
        !response.data ||
        !response.data.results ||
        !response.data.results.email
      ) {
        throw new Error("Invalid response format from Anymail API");
      }

      return {
        success: true,
        data: { email: response.data.results.email },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
});

export const anymailEmailLinkedinTool = createTool({
  id: "EmailFinderByLinkedIn",
  inputSchema: z.object({
    linkedin_url: z.string(),
  }),
  description: `Find a person's email address using their LinkedIn profile URL. Uses Anymail API to search and verify email addresses based on LinkedIn profile information.`,
  execute: async ({ context: { linkedin_url } }) => {
    const url = "https://api.anymailfinder.com/v5.0/search/linkedin-url.json";
    try {
      if (!process.env.ANYMAIL_API_KEY) {
        throw new Error("ANYMAIL_API_KEY is not configured");
      }

      const response = await axios.post(
        url,
        { linkedin_url },
        {
          headers: {
            Authorization: `Bearer ${process.env.ANYMAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );
      console.log(response.data);
      if (
        !response.data ||
        !response.data.results ||
        !response.data.results.email
      ) {
        throw new Error("Invalid response format from Anymail API");
      }

      return {
        success: true,
        data: { email: response.data.results.email },
        error: null,
      };
    } catch (error) {
      console.error("Anymail tool error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
});
