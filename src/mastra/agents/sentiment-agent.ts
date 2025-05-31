import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const sentimentAgent = new Agent({
  name: "sentiment agent",
  instructions:
    "You are a sentiment analysis agent. Your job is to take a text and analyze the sentiment of the text. You will be given a text and you will need to analyze the sentiment of the text. You will need to return the sentiment of the text. positive, negative, or neutral.",
  model: openai("gpt-4o-mini"),
});
