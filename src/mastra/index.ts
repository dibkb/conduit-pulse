import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { renameAgent } from "./agents/rename-agent";
import { redditWorkflow } from "./workflows/reddit-workflow";
import { enrichmentWorkflow } from "./workflows/enrichment";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, redditWorkflow, enrichmentWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  agents: { renameAgent },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
