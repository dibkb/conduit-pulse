import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { renameAgent } from "./agents/rename-agent";
import { redditWorkflow } from "./workflows/reddit-workflow";
import { enrichmentWorkflow } from "./workflows/enrichment";
import {
  companyEnrichmentAgent,
  linkedinProfileUrlAgent,
  linkedinProfileAgent,
  emailDiscoveryAgent,
} from "./agents/linkedin-profile-url";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, redditWorkflow, enrichmentWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  agents: {
    renameAgent,
    linkedinProfileUrlAgent,
    companyEnrichmentAgent,
    linkedinProfileAgent,
    emailDiscoveryAgent,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
