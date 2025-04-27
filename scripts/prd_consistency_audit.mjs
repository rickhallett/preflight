#!/usr/bin/env bun
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { execSync } from "node:child_process";
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const PRD_DIR = path.resolve(process.cwd(), "specs/prds");
const AUDIT_REPORT_PATH = path.resolve(process.cwd(), "audit_report.csv");

// Status constants
const STATUS = {
  COMPLIANT: "Compliant",
  NON_COMPLIANT: "Non-Compliant",
};

// Initialize Convex client
const convex = new ConvexClient(process.env.CONVEX_DEPLOYMENT);

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
    if (!data || typeof data !== 'object') {
      console.warn(`Warning: Invalid YAML in ${path.basename(filePath)}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error parsing PRD file ${path.basename(filePath)}:`, error);
    return null;
  }
}

function compareArrays(prdArray, dbArray) {
  if (!prdArray && !dbArray) return true;
  if (!prdArray || !dbArray) return false;
  if (prdArray.length !== dbArray.length) return false;

  // Sort both arrays for consistent comparison
  const sortedPrd = [...prdArray].sort();
  const sortedDb = [...dbArray].sort();

  return sortedPrd.every((item, index) => item === sortedDb[index]);
}

function checkOptionsConsistency(prdOptions, dbOptions) {
  return compareArrays(prdOptions, dbOptions);
}

function checkSliderOptionsConsistency(prdSliderOptions, dbSliderOptions) {
  return compareArrays(prdSliderOptions, dbSliderOptions);
}

function checkLabelsConsistency(prdLabels, dbLabels) {
  return compareArrays(prdLabels, dbLabels);
}

async function auditPrdConsistency() {
  console.log("Starting PRD consistency audit...");

  // Get all PRD files
  const prdFiles = await listPrdFiles();
  console.log(`Found ${prdFiles.length} PRD files.`);

  // Get all steps from database
  const steps = await convex.query(api.steps.listAll);
  console.log(`Found ${steps.length} steps in database.`);

  // Create a map of steps by prdId for easier lookup
  const stepsMap = steps.reduce((map, step) => {
    map[step.prdId] = step;
    return map;
  }, {});

  // Prepare audit report data
  const auditResults = [];

  // Header row for CSV
  auditResults.push([
    "PRD ID",
    "PRD Title",
    "Specified Question Type",
    "Implemented Question Type",
    "Options Defined Correctly",
    "SliderOptions Defined Correctly",
    "Labels Defined Correctly",
    "Status",
    "Notes/Remediation Plan"
  ].join(","));

  // Audit each PRD against its implementation
  for (const prdFile of prdFiles) {
    const prdData = await parsePrd(prdFile);
    if (!prdData) {
      console.warn(`Skipping ${prdFile} due to parsing issues.`);
      continue;
    }

    const prdId = prdData.id;
    const dbStep = stepsMap[prdId];

    // If step doesn't exist in database
    if (!dbStep) {
      auditResults.push([
        prdId,
        prdData.title || "",
        prdData.convex_step_type || "",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        STATUS.NON_COMPLIANT,
        "Step not found in database"
      ].join(","));
      continue;
    }

    // Check type consistency
    const typeConsistent = prdData.convex_step_type === dbStep.type;

    // Check options consistency
    const optionsConsistent = checkOptionsConsistency(prdData.options, dbStep.options);

    // Check sliderOptions consistency
    const sliderOptionsConsistent = checkSliderOptionsConsistency(prdData.sliderOptions, dbStep.sliderOptions);

    // Check labels consistency
    const labelsConsistent = checkLabelsConsistency(prdData.labels, dbStep.labels);

    // Determine overall status
    const isCompliant = typeConsistent && optionsConsistent && sliderOptionsConsistent && labelsConsistent;
    const status = isCompliant ? STATUS.COMPLIANT : STATUS.NON_COMPLIANT;

    // Generate remediation notes
    let notes = "";
    if (!typeConsistent) {
      notes += `Type mismatch: PRD=${prdData.convex_step_type}, DB=${dbStep.type}; `;
    }
    if (!optionsConsistent) {
      notes += "Options mismatch; ";
    }
    if (!sliderOptionsConsistent) {
      notes += "SliderOptions mismatch; ";
    }
    if (!labelsConsistent) {
      notes += "Labels mismatch; ";
    }

    // Add result to audit
    auditResults.push([
      prdId,
      prdData.title || "",
      prdData.convex_step_type || "",
      dbStep.type || "",
      optionsConsistent ? "Yes" : "No",
      sliderOptionsConsistent ? "Yes" : "No",
      labelsConsistent ? "Yes" : "No",
      status,
      notes
    ].join(","));
  }

  // Save audit report to file
  await fs.writeFile(AUDIT_REPORT_PATH, auditResults.join("\n"));
  console.log(`Audit report saved to ${AUDIT_REPORT_PATH}`);

  // Report summary
  const compliantCount = auditResults.slice(1).filter(line => line.includes(STATUS.COMPLIANT)).length;
  const nonCompliantCount = auditResults.slice(1).filter(line => line.includes(STATUS.NON_COMPLIANT)).length;

  console.log("\nAudit Summary:");
  console.log(`Total PRDs: ${prdFiles.length}`);
  console.log(`Compliant: ${compliantCount}`);
  console.log(`Non-Compliant: ${nonCompliantCount}`);

  return {
    auditResults,
    compliantCount,
    nonCompliantCount
  };
}

async function main() {
  try {
    console.log("Starting PRD Data Consistency Audit");
    const auditResult = await auditPrdConsistency();

    // If there are non-compliant PRDs, suggest next steps
    if (auditResult.nonCompliantCount > 0) {
      console.log("\nRemediation Recommended:");
      console.log("1. Review the audit_report.csv file for details on inconsistencies");
      console.log("2. Run the fix script to automatically remediate issues:");
      console.log("   bun run scripts/prd_consistency_fix.mjs");
    } else {
      console.log("\nAll PRDs are compliant with their implementations. No remediation needed.");
    }

  } catch (error) {
    console.error("Error running PRD consistency audit:", error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (process.argv[1] === import.meta.url) {
  main();
}

export { auditPrdConsistency }; 