import { createStep, createWorkflow } from "@mastra/core/workflows";
import { linkedInDummy, LinkedInPerson } from "./type";
// Assuming LinkedInPerson is a Zod schema or type
import { z } from "zod";
import {
  companyEnrichmentAgent,
  companyIdentificationAgent,
  emailDiscoveryAgent,
  linkedinProfileAgent,
  linkedinProfileUrlAgent,
  sparseInputStrategyAgent,
} from "../agents/linkedin-profile-url";

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
    return { ...linkedInDummy, ...inputData };
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
  execute: async ({ inputData }) => {
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
    const response = await companyEnrichmentAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(data),
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
  execute: async ({ inputData }) => {
    if (inputData.email) {
      return inputData;
    }
    const response = await emailDiscoveryAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(inputData),
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
  execute: async ({ inputData }) => {
    if (isFull(inputData)) {
      return inputData;
    }
    const response = await sparseInputStrategyAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(inputData),
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
    if (isFull(inputData)) {
      return inputData;
    }
    const response = await companyIdentificationAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(inputData),
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
  execute: async ({ inputData }) => {
    if (inputData.linkedin_url) {
      return inputData;
    }

    const response = await linkedinProfileUrlAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(inputData),
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
    if (isFull(inputData)) {
      return inputData;
    }

    const response = await linkedinProfileAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(inputData),
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

export const step2bWorkflow = createWorkflow({
  id: "step2b-workflow", // Handles enrichment path when full name and company are initially known
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
})
  .then(step2bNameCompanyStep)
  .then(step2aLinkedInStep) // Uses the URL found in 2B
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
