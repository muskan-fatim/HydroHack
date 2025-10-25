import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { HydroHackworkflow } from "./workflows/HydroHackworkflow";
import { waterReminderAgent } from "./agents/waterReminderAgent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from "./scorers/weather-scorer";
import "dotenv/config";

export const mastra = new Mastra({
  workflows: { HydroHackworkflow },
  agents: { waterReminderAgent },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
  },
  storage: new LibSQLStore({
    url: ":memory:", // use "file:../mastra.db" to persist data
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: {
    default: { enabled: true },
  },
});
