#!/usr/bin/env bun
import { run } from "convex/server";
import { internal } from "../convex/_generated/api";

async function deleteAllSteps() {
  console.log("Attempting to delete all documents from the 'steps' table...");

  try {
    const result = await run(internal.steps.deleteAllSteps, {});
    console.log(`Deletion successful: ${result.deletedCount} steps removed.`);
  } catch (error) {
    console.error("Error running deleteAllSteps mutation:", error);
    process.exit(1);
  }
}

deleteAllSteps().catch((error) => {
  console.error("Error deleting steps:", error);
  process.exit(1);
}); 