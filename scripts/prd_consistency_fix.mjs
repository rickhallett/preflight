#!/usr/bin/env bun
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { execSync } from "node:child_process";
import { Buffer } from "node:buffer";
import dotenv from "dotenv";
import { auditPrdConsistency } from "./prd_consistency_audit.mjs";

// Load environment variables
dotenv.config({ path: '.env.local' });

const PRD_DIR = path.resolve(process.cwd(), "specs/prds");
const AUDIT_REPORT_PATH = path.resolve(process.cwd(), "audit_report.csv");

async function loadAuditReport() {
  try {
    const csvContent = await fs.readFile(AUDIT_REPORT_PATH, "utf-8");
    const lines = csvContent.split("\n");

    // Skip header row
    const results = lines.slice(1).map(line => {
      const [
        prdId,
        title,
        specifiedType,
        implementedType,
        optionsCorrect,
        sliderOptionsCorrect,
        labelsCorrect,
        status,
        notes
      ] = line.split(",");

      return {
        prdId,
        title,
        specifiedType,
        implementedType,
        optionsCorrect: optionsCorrect === "Yes",
        sliderOptionsCorrect: sliderOptionsCorrect === "Yes",
        labelsCorrect: labelsCorrect === "Yes",
        status,
        notes
      };
    });

    return results;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Audit report not found at ${AUDIT_REPORT_PATH}. Please run the audit script first.`);
    } else {
      console.error(`Error reading audit report:`, error);
    }
    return [];
  }
}

async function getPrdData(prdId) {
  const prdFileName = `${prdId}.md`;
  const prdPath = path.join(PRD_DIR, prdFileName);

  try {
    return await parsePrd(prdPath);
  } catch (error) {
    console.error(`Error getting PRD data for ${prdId}:`, error);
    return null;
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
    if (!data || typeof data !== 'object') {
      console.warn(`Warning: Invalid YAML in ${path.basename(filePath)}`);
      return null;
    }
    return {
      data,
      filePath
    };
  } catch (error) {
    console.error(`Error parsing PRD file ${path.basename(filePath)}:`, error);
    return null;
  }
}

async function fixPrdConsistency() {
  console.log("Starting PRD consistency fix...");

  // Ensure the audit exists or run it
  let auditResults = await loadAuditReport();
  if (auditResults.length === 0) {
    console.log("No audit report found. Running audit first...");
    await auditPrdConsistency();
    auditResults = await loadAuditReport();

    if (auditResults.length === 0) {
      console.error("Failed to generate audit report. Exiting.");
      process.exit(1);
    }
  }

  // Filter for non-compliant steps
  const nonCompliantSteps = auditResults.filter(result => result.status === "Non-Compliant");
  console.log(`Found ${nonCompliantSteps.length} non-compliant steps to fix.`);

  if (nonCompliantSteps.length === 0) {
    console.log("All steps are compliant. No fixes needed.");
    return;
  }

  let fixedCount = 0;

  for (const step of nonCompliantSteps) {
    console.log(`\nFixing step: ${step.prdId}`);

    // Get PRD data
    const prdFile = await findPrdFile(step.prdId);
    if (!prdFile) {
      console.warn(`Cannot find PRD file for ${step.prdId}. Skipping.`);
      continue;
    }

    const prdResult = await parsePrd(prdFile);
    if (!prdResult) {
      console.warn(`Cannot parse PRD file for ${step.prdId}. Skipping.`);
      continue;
    }

    const { data: prdData, filePath } = prdResult;

    // Create step data for update
    const stepData = {
      prdId: step.prdId,
      index: prdData.index || 0,
      title: prdData.title || "",
      prompt: prdData.prompt || "",
      type: prdData.convex_step_type || "text",
      options: prdData.options || [],
      sliderOptions: prdData.sliderOptions || [],
      labels: prdData.labels || [],
      images: prdData.images || [],
      rows: prdData.rows || [],
      columns: prdData.columns || [],
      hierarchicalOptions: prdData.hierarchicalOptions || null,
    };

    try {
      // Special handling for step-02-data-sources
      if (step.prdId === "step-02-data-sources" && stepData.type === "multiselect_with_slider") {
        console.log("Applying special handling for step-02-data-sources");
        stepData.options = [
          "Structured clinical notes",
          "ICD-10 / SNOMED codes",
          "Lab results",
          "Medication data",
          "Vital signs data",
          "Imaging reports (text)",
          "Imaging data (DICOM)",
          "Patient-reported outcomes",
          "Genomic/family history data"
        ];
        stepData.sliderOptions = ["0", "100", "1"]; // min, max, step
      }

      // Update step in database
      await updateStepInDatabase(stepData);
      console.log(`Fixed step: ${step.prdId}`);
      fixedCount++;
    } catch (error) {
      console.error(`Error fixing step ${step.prdId}:`, error);
    }
  }

  console.log(`\nFix operations completed. Fixed ${fixedCount} of ${nonCompliantSteps.length} non-compliant steps.`);

  if (fixedCount > 0) {
    console.log("Running final audit to verify fixes...");
    await auditPrdConsistency();
  }
}

async function findPrdFile(prdId) {
  const entries = await fs.readdir(PRD_DIR, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(PRD_DIR, entry.name));

  for (const file of mdFiles) {
    const content = await fs.readFile(file, "utf-8");
    if (content.includes(`id: ${prdId}`)) {
      return file;
    }
  }

  return null;
}

async function updateStepInDatabase(stepData) {
  console.log(`Updating step in database: ${stepData.prdId}`);

  try {
    // Prepare payload
    const payload = { stepData };
    // JSON stringify
    const jsonString = JSON.stringify(payload);
    // Base64 encode
    const base64String = Buffer.from(jsonString).toString('base64');

    // Construct args for convex run
    const convexArgs = { stepDataBase64: base64String };
    const argsJsonString = JSON.stringify(convexArgs);

    // Execute convex run command
    const command = `bunx convex run migrations:seedSinglePrdAction '${argsJsonString}'`;
    console.log(`  Executing: bunx convex run migrations:seedSinglePrdAction '{"stepDataBase64": "<base64_string>"}'`);

    execSync(command, { stdio: 'inherit' });
    console.log(`  Successfully updated step ${stepData.prdId} in database`);
  } catch (error) {
    console.error(`Error executing convex run for step ${stepData.prdId}:`, error);
    throw error;
  }
}

async function main() {
  try {
    await fixPrdConsistency();
  } catch (error) {
    console.error("Error fixing PRD consistency:", error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (process.argv[1] === import.meta.url) {
  main();
} 