import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const renameAgent = new Agent({
  name: "Rename agent",
  instructions:
    "You are a title optimization agent. Your job is to take verbose or lengthy titles and convert them into concise, search-engine-friendly versions. Focus on maintaining the key information while removing unnecessary words and making the title more scannable and SEO-friendly.",
  model: openai("gpt-4o-mini"),
});
