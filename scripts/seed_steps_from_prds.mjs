#!/usr/bin/env bun
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { execSync } from "node:child_process"; // Import execSync
import { Buffer } from "node:buffer"; // For Base64 encoding

const PRD_DIR = path.resolve(process.cwd(), "specs/prds");

async function listPrdFiles() {
  const prdPath = path.resolve(process.cwd(), PRD_DIR);
  console.log(`Looking for PRDs in: ${prdPath}`);
  try {
    const entries = await fs.readdir(prdPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.startsWith("step-") && entry.name.endsWith(".md"))
      .map((entry) => path.join(prdPath, entry.name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/step-(\d+)-/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/step-(\d+)-/)?.[1] || '0', 10);
        return numA - numB;
      });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: PRD directory not found at ${prdPath}. Make sure you are running the script from the project root.`);
    } else {
      console.error(`Error reading PRD directory ${prdPath}:`, error);
    }
    return [];
  }
}

async function parsePrd(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const frontMatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
    if (!frontMatterMatch || !frontMatterMatch[1]) {
      console.warn(`Warning: No YAML front matter found in ${path.basename(filePath)}`);
      return null;
    }
    const data = yaml.load(frontMatterMatch[1]);
    if (!data || typeof data !== 'object' || !data.id || !data.title || !data.prompt || !data.input_type || !data.convex_step_type) {
      console.warn(`Warning: Missing required fields (id, title, prompt, input_type, convex_step_type) in ${path.basename(filePath)}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error parsing PRD file ${path.basename(filePath)}:`, error);
    return null;
  }
}

function extractIndexFromId(id) {
  const match = id.match(/^step-(\d+)-/);
  return match ? parseInt(match[1], 10) - 1 : null;
}

async function seedSteps() {
  console.log("Starting step seeding process via local script calling convex run...");
  const prdFiles = await listPrdFiles();
  console.log(`Found ${prdFiles.length} PRD files.`);

  let successfulSeeds = 0;
  let failedSeeds = 0;

  for (const prdFile of prdFiles) {
    const prdData = await parsePrd(prdFile);
    if (!prdData) {
      failedSeeds++;
      continue;
    }

    const stepIndex = extractIndexFromId(prdData.id);
    if (stepIndex === null || stepIndex < 0) {
      console.warn(`Warning: Could not extract valid index (>=0) from ID "${prdData.id}" in ${path.basename(prdFile)}. Skipping.`);
      failedSeeds++;
      continue;
    }

    const stepDocPayload = {
      prdId: prdData.id,
      index: stepIndex,
      title: prdData.title,
      prompt: prdData.prompt,
      type: prdData.convex_step_type,
      options: prdData.options || [],
    };

    try {
      console.log(`Executing convex run for step: ${prdData.id} (Index: ${stepIndex})`);

      // Prepare the payload containing stepData
      const payload = { stepData: stepDocPayload };
      // JSON stringify
      const jsonString = JSON.stringify(payload);
      // Base64 encode
      const base64String = Buffer.from(jsonString).toString('base64');

      // Construct the argument object for convex run
      const convexArgs = { stepDataBase64: base64String };
      // JSON stringify the *arguments object*
      const argsJsonString = JSON.stringify(convexArgs);

      // Construct the command, quoting the JSON arg string
      const command = `bunx convex run migrations:seedSinglePrdAction '${argsJsonString}'`;
      console.log(`  Executing: bunx convex run migrations:seedSinglePrdAction '{"stepDataBase64": "<base64_string>"}'`); // Log redacted

      // Execute the command synchronously
      execSync(command, { stdio: 'inherit' });

      console.log(`  Successfully executed convex run for ${prdData.id}`);
      successfulSeeds++;
    } catch (error) {
      console.error(`Error executing convex run for step ${prdData.id} from ${path.basename(prdFile)}:`, error);
      failedSeeds++;
      console.error("Stopping script due to error.");
      process.exit(1);
    }
  }

  console.log("\nSeeding script finished.");
  console.log(`  Successfully processed: ${successfulSeeds}`);
  console.log(`  Failed/Skipped: ${failedSeeds}`);

  if (failedSeeds > 0) {
    console.error("\nPlease review the warnings and errors above.");
    process.exit(1);
  }
}

seedSteps().catch((error) => {
  console.error("Unhandled error during seeding script execution:", error);
  process.exit(1);
});
