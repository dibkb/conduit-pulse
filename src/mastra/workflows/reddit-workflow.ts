import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { redditSearchResultSchema, searchReddit } from "../../google-search";

const inputSchema = z.object({
  productTitle: z
    .string()
    .describe("The original amazon product title available"),
});

const searchGoogleOutputSchema = z.object({
  refinedTitle: z.string().describe("The refined seo optimized search title"),
});

const renameTitleStep = createStep({
  id: "rename-title",
  description: "Rename the title of a post",
  inputSchema: inputSchema,
  outputSchema: z.object({
    outputValue: z.string().describe("The optimized title"),
  }),
  execute: async ({
    inputData,
    mastra,
    getStepResult,
    getInitData,
    runtimeContext,
  }) => {
    const agent = mastra?.getAgent("renameAgent");
    const response = await agent.generate(
      [
        {
          role: "user",
          content:
            "You are a title optimization agent. Your job is to take verbose or lengthy titles and convert them into concise, search-engine-friendly versions. Focus on maintaining the key information while removing unnecessary words and making the title more scannable and SEO-friendly. The title is: " +
            inputData.productTitle,
        },
      ],
      {
        output: searchGoogleOutputSchema,
      }
    );
    return {
      outputValue: response.object.refinedTitle,
    };
  },
});

const googleSearchStep = createStep({
  id: "google-search",
  description: "Search Google for the optimized title",
  inputSchema: z.object({
    outputValue: z.string().describe("The refined seo optimized search title"),
  }),
  outputSchema: z.object({
    outputValue: z.array(redditSearchResultSchema),
  }),
  execute: async ({ inputData }) => {
    const results = await searchReddit(inputData.outputValue);
    return {
      outputValue: results,
    };
  },
});

const redditWorkflow = createWorkflow({
  id: "reddit-workflow",
  inputSchema: inputSchema,
  outputSchema: z.object({
    outputValue: z.string(),
  }),
  steps: [renameTitleStep, googleSearchStep],
})
  .then(renameTitleStep)
  .then(googleSearchStep);

redditWorkflow.commit();

export { redditWorkflow };
