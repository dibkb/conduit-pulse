import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { linkedInProfileTool } from "../tools/linkedin";
import { linkedInSearchTool } from "../tools/linkedin";
import { scrapePageTool } from "../tools/scrape";
import { searchTool } from "../tools/search";
import { anymailEmailLinkedinTool, anymailEmailTool } from "../tools/anymail";

export const linkedinProfileUrlAgent = new Agent({
  name: "Linkedin Profile URL Agent",
  instructions: `You are a LinkedIn profile URL agent. Your primary objective is to find the most accurate LinkedIn profile URL for a person given their full name and current company name. Follow these steps:
    1. Use the provided search tools to look up the person's LinkedIn profile
    2. Analyze search results to identify the most likely matching profile
    3. Verify the match by comparing the person's name and company information
    4. Populate the LinkedInPerson object with the most accurate LinkedIn profile URL
    If you cannot find a strong match, indicate this clearly in your response.
    Populate other fields in the LinkedInPerson object with the most accurate information you can find.
    `,

  model: openai("gpt-4o-mini"),
  tools: {
    search: searchTool,
    linkedInSearch: linkedInSearchTool,
  },
});

export const linkedinProfileAgent = new Agent({
  name: "Linkedin Profile Agent",
  instructions: `You are a LinkedIn profile agent. Your primary objective is to find out about a person from their LinkedIn profile. Follow these steps:
    1. Use the provided search tools to look up the person's LinkedIn profile
    2. Analyze search results to identify the most likely matching profile
    3. Verify the match by comparing the person's name and company information
    4. Try to find all the information you can about the person from the LinkedIn profile


    Populate other fields in the LinkedInPerson object with the most accurate information you can find.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    search: searchTool,
    linkedInProfile: linkedInProfileTool,
  },
});

export const companyEnrichmentAgent = new Agent({
  name: "Company Enrichment Agent",
  instructions: `You are a Company Enrichment agent. Your primary objective is to find out about a company from their linkedin profile, website, and google search.
  
    Populate other fields in the LinkedInPerson object with the most accurate information you can find.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    search: searchTool,
    scrapePage: scrapePageTool,
  },
});

export const emailDiscoveryAgent = new Agent({
  name: "Email Discovery Agent",
  instructions: `You are a Email Discovery agent. You will be given a person's name and company name. You will need to find the person's email.
  
    Populate other fields in the LinkedInPerson object with the most accurate information you can find.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    anymailEmailTool: anymailEmailTool,
    anymailEmailLinkedinTool: anymailEmailLinkedinTool,
  },
});
