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

export const sparseInputStrategyAgent = new Agent({
  name: "Sparse Input Strategy Agent",
  instructions: `You are a Sparse Input Strategy agent. Your primary objective is to analyze minimal input data (like just a name or just a company) and determine the most effective search strategy. Follow these steps:
    1. Analyze the provided input data to identify what information is available
    2. Determine if the input is sufficient for a direct person search or if company context is needed first
    3. If only a name is available:
       - Consider the uniqueness of the name
       - Evaluate if additional context is needed before searching
    4. If only a company is available:
       - Determine if company verification is needed first
       - Plan how to use company information to narrow down person search
    5. Output a structured strategy including:
       - Initial search approach (person-first or company-first)
       - Required additional context
       - Confidence level in the strategy
       - Potential challenges or limitations
    
    Your goal is to maximize the chances of finding the correct person by choosing the most efficient search path given the limited information.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    search: searchTool,
    linkedInSearch: linkedInSearchTool,
    scrapePage: scrapePageTool,
  },
});

export const companyIdentificationAgent = new Agent({
  name: "Company Identification Agent",
  instructions: `You are a Company Identification agent. Your primary objective is to identify and validate company information when person details are insufficient. Follow these steps:
    1. Analyze the provided company name or partial company information
    2. Use multiple sources to validate and enrich company data:
       - Search for official company websites
       - Find company LinkedIn pages
       - Verify company domains
       - Gather additional company identifiers
    3. For each potential company match:
       - Verify company legitimacy
       - Cross-reference multiple sources
       - Check for company aliases or variations
    4. Output structured company information including:
       - Official company name
       - Company LinkedIn URL
       - Company website/domain
       - Company identifiers
       - Confidence level in the match
       - Additional company metadata
    
    Your goal is to provide accurate company context that can be used to improve person search accuracy.
    If multiple potential matches are found, rank them by confidence and provide reasoning.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    search: searchTool,
    linkedInSearch: linkedInSearchTool,
    scrapePage: scrapePageTool,
    linkedInProfile: linkedInProfileTool,
  },
});
