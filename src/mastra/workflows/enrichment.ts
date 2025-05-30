import { createStep, createWorkflow } from "@mastra/core/workflows";
import { LinkedInPerson } from "./type";
// Assuming LinkedInPerson is a Zod schema or type
import { z } from "zod";
import { mastra } from "..";

function isFull(inputData: z.infer<typeof LinkedInPerson>): boolean {
  return Object.values(inputData).every((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true; // For non-string values, consider them present if they exist
  });
}
export const prioritizeLinkedInStep = createStep({
  id: "prioritize-linkedin",
  description: "Prioritize the LinkedIn post", // The description seems slightly off from the step's role in the workflow
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    // Objective: To analyze the input LinkedInPerson data to determine the most effective
    // initial strategy for identifying or verifying the person's LinkedIn profile.
    // This involves checking if a LinkedIn URL is already provided, if full name and
    // company name are available for a targeted search, or if a broader,
    // GPT-directed strategy is needed due to minimal information. The output
    // would be the input data, possibly augmented with flags or decisions to guide
    // routing to the appropriate next step (e.g., Step 2A, 2B, or 2C logic).
    return inputData;
  },
});

// 4---
const step4CompanyDetailsStep = createStep({
  id: "step-4-company-details",
  description: "Step 4: Company Details",
  inputSchema: z.object({
    // Input is expected to be an object with outputs of other workflows
    "step2b-workflow": LinkedInPerson,
    "step2c-workflow": LinkedInPerson,
  }),
  outputSchema: LinkedInPerson,
  execute: async ({ inputData, mastra }) => {
    // Objective: To gather and enrich comprehensive details about the identified company.
    // This step assumes a company has been at least partially identified (e.g., its name,
    // domain, or company LinkedIn URL is known, potentially from the output of
    // 'step2b-workflow' or 'step2c-workflow'). It would use tools like Scrapin.io
    // (with a company LinkedIn URL), Scrapeowl (with a company domain to get descriptions),
    // or SerpAPI to find/verify the company's canonical name, official domain,
    // detailed description, industry, size, etc. The choice to use inputData["step2b-workflow"]
    // suggests that path is expected to yield more complete data for company enrichment.

    const data = {
      ...inputData["step2b-workflow"],
      ...Object.fromEntries(
        Object.entries(inputData["step2c-workflow"] || {}).filter(
          ([_, value]) =>
            value !== null &&
            value !== undefined &&
            value.toString().trim() !== ""
        )
      ),
    };
    if (isFull(data)) {
      return data;
    }
    const companyEnrichmentAgent = mastra.getAgent("companyEnrichmentAgent");
    const response = await companyEnrichmentAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Enrich the company details for the company ${data.company_name}. Here are the full details ${data}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );
    return response.object;
  },
});

const step5EmailDiscoveryStep = createStep({
  id: "step-5-email-discovery",
  description: "Step 5: Email Discovery",
  inputSchema: LinkedInPerson, // Assumes LinkedInPerson now contains enriched person and company data
  outputSchema: LinkedInPerson,
  execute: async ({ inputData, mastra }) => {
    // Objective: To find a verified professional email address for the identified person.
    // This step relies on having accurately determined the person's first name, last name,
    // and the company's domain. It would utilize a specialized tool like AnymailFinder,
    // providing these details to discover the email. The found email address would then
    // be added to the LinkedInPerson data object.
    if (inputData.email) {
      return inputData;
    }
    const emailDiscoveryAgent = mastra.getAgent("emailDiscoveryAgent");
    const response = await emailDiscoveryAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Find the email for the person ${inputData.full_name} who works at ${inputData.company_name}. Here are the full details ${inputData}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );
    return response.object;
  },
});

export const step4Workflow = createWorkflow({
  id: "last-workflow", // Represents the final stages of enrichment for company and email
  inputSchema: z.object({
    "step2b-workflow": LinkedInPerson,
    "step2c-workflow": LinkedInPerson,
  }),
  outputSchema: LinkedInPerson,
})
  .then(step4CompanyDetailsStep)
  .then(step5EmailDiscoveryStep)
  .commit();

// 2c----

const step2cMinimalInfoStep = createStep({
  id: "step-2-c-minimal-info",
  description: "Step 2C: Minimal Info / GPT-directed search strategy",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson, // Output might include a strategy decision
  execute: async ({ inputData, mastra }) => {
    // Objective: To handle cases where minimal information (e.g., only a name or
    // only a company name) is available for the person. The core task is to use
    // GPT to analyze this sparse input and decide the most viable initial search
    // strategy: whether to first attempt a broad search for the person or to try
    // and identify the company first to provide context for a subsequent, more
    // targeted person search. The output would be the input data, potentially
    // annotated with this strategic decision.
    if (isFull(inputData)) {
      return inputData;
    }
    const sparseInputStrategyAgent = mastra.getAgent(
      "sparseInputStrategyAgent"
    );
    const response = await sparseInputStrategyAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the input data and decide the most viable initial search strategy: whether to first attempt a broad search for the person or to try and identify the company first to provide context for a subsequent, more targeted person search. Here are the full details ${inputData}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );
    return response.object;
  },
});

const step4CompanyIdFirstStep = createStep({
  id: "step-4-company-id-first", // Corresponds to trying to ID company when person info is sparse
  description: "Step 4A: Company ID First (when person ID is not direct)",
  inputSchema: LinkedInPerson, // Input from step2cMinimalInfoStep
  outputSchema: LinkedInPerson, // Output includes any found company identifiers
  execute: async ({ inputData, mastra }) => {
    // Objective: To identify the company associated with the person, particularly when
    // the person's own details are insufficient for direct identification and identifying
    // the company first could provide necessary context. This step would use the input
    // company name (if available from the CSV or inferred) with tools like Scrapin.io
    // (company search) or SerpAPI (to find an official website/domain or company
    // LinkedIn page). The output would be the LinkedInPerson object, updated with any
    // found company identifiers such as the company's LinkedIn URL or domain.
    if (isFull(inputData)) {
      return inputData;
    }
    const companyIdentificationAgent = mastra.getAgent(
      "companyIdentificationAgent"
    );
    const response = await companyIdentificationAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Identify the company associated with the person ${inputData.full_name}. Here are the full details ${inputData}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );
    return response.object;
  },
});

export const step2cWorkflow = createWorkflow({
  id: "step2c-workflow", // Handles enrichment path for minimal initial information
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
})
  .then(step2cMinimalInfoStep)
  .then(step4CompanyIdFirstStep) // After deciding strategy, attempts to ID company
  .commit();

// 2b---This workflow is used to enrich the LinkedIn person data when name and company are known.
const step2bNameCompanyStep = createStep({
  id: "step-2-b-name-company",
  description: "Step 2B: Full Name & Company Name KNOWN",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  // Output should ideally include a found person_linkedin_url
  execute: async ({ inputData, mastra }) => {
    // Objective: To find the person's LinkedIn profile URL when their full name and
    // current company name are known. This step would primarily use Scrapin.io to
    // search for the person using these details. GPT would then be used to analyze
    // the search results and select the most accurate profile. If a strong match is
    // not found via Scrapin.io, a secondary objective (or a subsequent step) would
    // be to use SerpAPI for a broader Google search to locate the LinkedIn profile.
    // The 'dowhile' condition here seems like a placeholder; in a real scenario, it would
    // loop based on search success or retry attempts.
    if (inputData.linkedin_url) {
      return inputData;
    }
    const linkedinProfileUrlAgent = mastra.getAgent("linkedinProfileUrlAgent");

    const response = await linkedinProfileUrlAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Find the LinkedIn profile URL for the person ${inputData.full_name} who works at ${inputData.company_name}. Here are the full details ${inputData}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );

    return response.object;
  },
});

const step2aLinkedInStep = createStep({
  id: "step-2-a-linkedin",
  description: "Step 2A: Person LinkedIn URL KNOWN (or found from 2B)",
  inputSchema: LinkedInPerson, // Assumes person_linkedin_url is now populated
  outputSchema: LinkedInPerson, // Output includes key details extracted from the profile
  execute: async ({ inputData, mastra }) => {
    // Objective: To use a known or recently discovered person_linkedin_url to fetch
    // initial key details directly from their LinkedIn profile. This step uses a tool
    // like Scrapin.io with the specific LinkedIn URL. GPT would then assist in
    // extracting critical information such as the person's verified full name, current
    // job title, current company name, and the URL of their current company's
    // LinkedIn page. This information populates the LinkedInPerson object.

    if (isFull(inputData)) {
      return inputData;
    }

    const linkedinProfileAgent = mastra.getAgent("linkedinProfileAgent");
    const response = await linkedinProfileAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Find out about the person from the LinkedIn profile URL ${inputData.linkedin_url}. Here are the full details ${inputData}`,
            },
          ],
        },
      ],
      {
        experimental_output: LinkedInPerson,
      }
    );

    return response.object;
  },
});

const enrichLinkedInPersonStep = createStep({
  id: "enrich-linkedin-person", // Corresponds to Step 3 in the ASCII diagram
  description:
    "Step 3: Enrich Full LinkedIn Person Profile (Assumes person_linkedin_url is confirmed)",
  inputSchema: LinkedInPerson, // Input has a confirmed person_linkedin_url
  outputSchema: LinkedInPerson, // Output is a more comprehensively filled LinkedInPerson object
  execute: async ({ inputData }) => {
    // Objective: To perform a comprehensive enrichment of the person's details using their
    // confirmed LinkedIn URL. This step goes beyond initial key details and aims to
    // fetch all available structured data from the profile via Scrapin.io. This
    // includes details like full work experience history, education, skills,
    // recommendations, and any other publicly available information. GPT might assist
    // in parsing or structuring this extensive data. The LinkedInPerson object is
    // updated with this rich set of information.

    if (isFull(inputData)) {
      return inputData;
    }
    return inputData;
  },
});

export const step2bWorkflow = createWorkflow({
  id: "step2b-workflow", // Handles enrichment path when full name and company are initially known
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
})
  .then(step2bNameCompanyStep)
  .then(step2aLinkedInStep) // Uses the URL found in 2B
  .then(enrichLinkedInPersonStep) // Gets full details
  .commit();

const enrichmentWorkflow = createWorkflow({
  id: "enrichment-workflow", // Main workflow orchestrating different paths
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
})
  .then(prioritizeLinkedInStep) // Initial decision step
  .branch([
    // Conditional branching based on available data
    [
      async (
        { inputData } // Condition for step2bWorkflow (more direct path)
      ) =>
        inputData.linkedin_url || // LinkedIn URL is present OR
        (inputData.full_name && inputData.company_name), // Full name AND company name are present
      step2bWorkflow,
    ],
    [
      async (
        { inputData } // Condition for step2cWorkflow (minimal info path)
      ) =>
        !inputData.linkedin_url && // No direct LinkedIn URL AND
        (!inputData.full_name || !inputData.company_name) && // EITHER full name OR company name is missing (but not both, covered by next)
        (inputData.full_name || inputData.company_name), // BUT at least one of them is present
      step2cWorkflow,
    ],
    // It might be beneficial to have a fallback or "cannot process" path if none of these conditions are met.
  ])
  .then(step4Workflow) // Common final steps for company details and email discovery
  .commit();

export { enrichmentWorkflow };
