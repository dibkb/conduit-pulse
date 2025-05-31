import { createStep, createWorkflow } from "@mastra/core/workflows";

import { LinkedInPerson } from "../type";

export const prioritizeLinkedInStep = createStep({
  id: "prioritize-linkedin",
  description: "Prioritize the LinkedIn post",
  inputSchema: LinkedInPerson,
  outputSchema: LinkedInPerson,
  execute: async ({ inputData }) => {
    return inputData;
  },
});
