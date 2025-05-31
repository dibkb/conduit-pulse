import z from "zod";
import { LinkedInPerson } from "../type";
import { createStep, createWorkflow } from "@mastra/core/workflows";

const step4CompanyDetailsStep = createStep({
  id: "step-4-company-details",
  description: "Step 4: Company Details",
  inputSchema: z.object({
    "step2b-workflow": LinkedInPerson,
    "step2c-workflow": LinkedInPerson,
  }),
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    // Use the output from step2b-workflow as it has more complete data
    return inputData["step2b-workflow"];
  },
});

const step5EmailDiscoveryStep = createStep({
  id: "step-5-email-discovery",
  description: "Step 5: Email Discovery",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    // For now, just pass through the data
    return inputData;
  },
});

export const step4Workflow = createWorkflow({
  id: "last-workflow",
  inputSchema: z.object({
    "step2b-workflow": LinkedInPerson,
    "step2c-workflow": LinkedInPerson,
  }),
  outputSchema: LinkedInPerson,
})
  .then(step4CompanyDetailsStep)
  .then(step5EmailDiscoveryStep)
  .commit();
