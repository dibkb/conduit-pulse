import { LinkedInPerson } from "../mastra/workflows/type";
import { z } from "zod";
export function cleanAndParseJson(
  input: string
): z.infer<typeof LinkedInPerson> {
  // Remove markdown code block markers if present
  const cleanedInput = input
    .replace(/^```json\s*/i, "") // Remove opening ```json
    .replace(/^```\s*/i, "") // Remove opening ``` if no language specified
    .replace(/\s*```$/g, "") // Remove closing ```
    .trim(); // Remove any extra whitespace

  try {
    return JSON.parse(cleanedInput) as z.infer<typeof LinkedInPerson>;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format after cleaning");
    }
    throw error;
  }
}
