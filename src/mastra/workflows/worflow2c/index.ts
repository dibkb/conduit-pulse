import { createWorkflow } from "@mastra/core/workflows";

import { createStep } from "@mastra/core/workflows";
import { LinkedInPerson } from "../type";

const step2cMinimalInfoStep = createStep({
  id: "step-2-c-minimal-info",
  description: "Step 2C: Minimal Info",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    return inputData;
  },
});

const step4CompanyIdFirstStep = createStep({
  id: "step-4-company-id-first",
  description: "Step 4: Company ID First",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    return inputData;
  },
});

export const step2cWorkflow = createWorkflow({
  id: "step2c-workflow",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
})
  .then(step2cMinimalInfoStep)
  .then(step4CompanyIdFirstStep)
  .commit();
