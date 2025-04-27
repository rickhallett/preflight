#!/usr/bin/env bun
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { execSync } from "node:child_process"; // Import execSync
import { Buffer } from "node:buffer"; // For Base64 encoding

const PRD_DIR = path.resolve(process.cwd(), "specs/prds");
const VALID_STEP_TYPES = [
  "text",
  "select",
  "multiselect",
  "radio",
  "slider",
  "number",
  "multiselect_with_slider",
  "dual_slider",
  "matrix",
  "ranked_choice",
  "conditional",
  // Custom UI component types
  "range_slider_with_labels",
  "visual_selector",
  "condensed_checkbox_grid",
  "hierarchical_select"
];

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

    // Validate step type
    if (!VALID_STEP_TYPES.includes(data.convex_step_type)) {
      console.warn(`Warning: Invalid convex_step_type "${data.convex_step_type}" in ${path.basename(filePath)}. Valid types are: ${VALID_STEP_TYPES.join(', ')}`);
      console.warn(`Defaulting to "text" type for ${data.id}`);
      data.convex_step_type = "text";
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

/**
 * Validate that the PRD data is consistent with best practices and schema requirements
 */
function validatePrdConsistency(prdData, stepIndex) {
  const validationIssues = [];

  // Check type-specific field requirements
  switch (prdData.convex_step_type) {
    case "select":
    case "multiselect":
    case "radio":
      if (!prdData.options || !Array.isArray(prdData.options) || prdData.options.length === 0) {
        validationIssues.push(`Missing or empty options array for '${prdData.convex_step_type}' type`);
      }
      break;

    case "slider":
      if (!prdData.sliderOptions || !Array.isArray(prdData.sliderOptions) || prdData.sliderOptions.length < 2) {
        validationIssues.push(`Missing or incomplete sliderOptions for 'slider' type (need at least min and max)`);
      }
      break;

    case "multiselect_with_slider":
      if (!prdData.options || !Array.isArray(prdData.options) || prdData.options.length === 0) {
        validationIssues.push(`Missing options array for 'multiselect_with_slider' type`);
      }
      if (!prdData.sliderOptions || !Array.isArray(prdData.sliderOptions) || prdData.sliderOptions.length < 2) {
        validationIssues.push(`Missing sliderOptions for 'multiselect_with_slider' type`);
      }
      break;

    case "range_slider_with_labels":
      if (!prdData.sliderOptions || !Array.isArray(prdData.sliderOptions) || prdData.sliderOptions.length < 2) {
        validationIssues.push(`Missing sliderOptions for 'range_slider_with_labels' type`);
      }
      if (!prdData.labels || !Array.isArray(prdData.labels) || prdData.labels.length < 2) {
        validationIssues.push(`Missing labels array for 'range_slider_with_labels' type (need at least 2 labels)`);
      }
      break;

    case "visual_selector":
      if (!prdData.images || !Array.isArray(prdData.images) || prdData.images.length === 0) {
        validationIssues.push(`Missing images array for 'visual_selector' type`);
      }
      break;

    case "condensed_checkbox_grid":
      if (!prdData.rows || !Array.isArray(prdData.rows) || prdData.rows.length === 0) {
        validationIssues.push(`Missing rows array for 'condensed_checkbox_grid' type`);
      }
      if (!prdData.columns || !Array.isArray(prdData.columns) || prdData.columns.length === 0) {
        validationIssues.push(`Missing columns array for 'condensed_checkbox_grid' type`);
      }
      break;

    case "hierarchical_select":
      if (!prdData.hierarchicalOptions) {
        validationIssues.push(`Missing hierarchicalOptions for 'hierarchical_select' type`);
      }
      break;

    case "dual_slider":
      if (!prdData.sliderOptions || !Array.isArray(prdData.sliderOptions) || prdData.sliderOptions.length < 2) {
        validationIssues.push(`Missing sliderOptions for 'dual_slider' type`);
      }
      break;

    case "matrix":
      if (!prdData.rows || !Array.isArray(prdData.rows) || prdData.rows.length === 0) {
        validationIssues.push(`Missing rows array for 'matrix' type`);
      }
      if (!prdData.columns || !Array.isArray(prdData.columns) || prdData.columns.length === 0) {
        validationIssues.push(`Missing columns array for 'matrix' type`);
      }
      break;
  }

  // Validate validation rules if present
  if (prdData.validation) {
    // Check that validation is an object
    if (typeof prdData.validation !== 'object') {
      validationIssues.push(`Validation must be an object`);
    } else {
      // Check for valid validation properties
      const { required, minLength, maxLength, minValue, maxValue, pattern, customValidation, errorMessage } = prdData.validation;

      // Validate required is a boolean if present
      if (required !== undefined && typeof required !== 'boolean') {
        validationIssues.push(`validation.required must be a boolean, got ${typeof required}`);
      }

      // Validate minLength and maxLength are numbers if present
      if (minLength !== undefined && (typeof minLength !== 'number' || minLength < 0)) {
        validationIssues.push(`validation.minLength must be a non-negative number, got ${minLength}`);
      }
      if (maxLength !== undefined && (typeof maxLength !== 'number' || maxLength < 0)) {
        validationIssues.push(`validation.maxLength must be a non-negative number, got ${maxLength}`);
      }

      // Validate minLength <= maxLength if both present
      if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
        validationIssues.push(`validation.minLength (${minLength}) must be <= maxLength (${maxLength})`);
      }

      // Validate minValue and maxValue are numbers if present
      if (minValue !== undefined && typeof minValue !== 'number') {
        validationIssues.push(`validation.minValue must be a number, got ${typeof minValue}`);
      }
      if (maxValue !== undefined && typeof maxValue !== 'number') {
        validationIssues.push(`validation.maxValue must be a number, got ${typeof maxValue}`);
      }

      // Validate minValue <= maxValue if both present
      if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
        validationIssues.push(`validation.minValue (${minValue}) must be <= maxValue (${maxValue})`);
      }

      // Validate pattern is a valid regex if present
      if (pattern !== undefined) {
        if (typeof pattern !== 'string') {
          validationIssues.push(`validation.pattern must be a string, got ${typeof pattern}`);
        } else {
          try {
            new RegExp(pattern);
          } catch (e) {
            validationIssues.push(`validation.pattern is not a valid regex: ${pattern}`);
          }
        }
      }

      // Validate customValidation is a string if present
      if (customValidation !== undefined && typeof customValidation !== 'string') {
        validationIssues.push(`validation.customValidation must be a string, got ${typeof customValidation}`);
      }

      // Validate errorMessage is a string if present
      if (errorMessage !== undefined && typeof errorMessage !== 'string') {
        validationIssues.push(`validation.errorMessage must be a string, got ${typeof errorMessage}`);
      }
    }
  }

  // Special validations for known PRD IDs
  if (prdData.id === "step-02-data-sources" && prdData.convex_step_type === "multiselect_with_slider") {
    if (!prdData.options || !prdData.options.some(opt => opt.includes("clinical"))) {
      validationIssues.push(`step-02-data-sources should have clinical data options`);
    }
  }

  if (prdData.id === "step-08-budget-procurement" && prdData.convex_step_type === "slider") {
    if (!prdData.sliderOptions || prdData.sliderOptions[1] !== "200") {
      validationIssues.push(`step-08-budget-procurement slider should go up to 200k`);
    }
  }

  if (prdData.id === "step-24-data-labeling-capacity" && prdData.convex_step_type === "slider") {
    if (!prdData.sliderOptions || prdData.sliderOptions[1] !== "100") {
      validationIssues.push(`step-24-data-labeling-capacity slider should go up to 100%`);
    }
  }

  return validationIssues;
}

async function seedSteps() {
  console.log("Starting step seeding process via local script calling convex run...");
  const prdFiles = await listPrdFiles();
  console.log(`Found ${prdFiles.length} PRD files.`);

  let successfulSeeds = 0;
  let failedSeeds = 0;
  let validationWarnings = 0;

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

    // Validate PRD consistency
    const validationIssues = validatePrdConsistency(prdData, stepIndex);
    if (validationIssues.length > 0) {
      console.warn(`\nWarning: Validation issues found in ${path.basename(prdFile)}:`);
      validationIssues.forEach(issue => console.warn(`  - ${issue}`));
      validationWarnings++;

      const continueWithIssues = process.env.FORCE_SEED === 'true' ||
        await promptForConfirmation(`Continue seeding ${prdData.id} despite validation issues?`);

      if (!continueWithIssues) {
        console.warn(`Skipping ${prdData.id} due to validation issues.`);
        failedSeeds++;
        continue;
      }
    }

    const stepDocPayload = {
      prdId: prdData.id,
      index: stepIndex,
      title: prdData.title,
      prompt: prdData.prompt,
      type: prdData.convex_step_type,
      options: prdData.options || [],
      sliderOptions: prdData.sliderOptions || [],
      // Add support for custom component fields
      labels: prdData.labels || [],
      images: prdData.images || [],
      rows: prdData.rows || [],
      columns: prdData.columns || [],
      hierarchicalOptions: prdData.hierarchicalOptions || null,
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
  console.log(`  Validation warnings: ${validationWarnings}`);

  if (failedSeeds > 0) {
    console.error("\nPlease review the warnings and errors above.");
    process.exit(1);
  }

  if (validationWarnings > 0) {
    console.warn("\nValidation warnings were detected. Consider running the audit script:");
    console.warn("  bun run scripts/prd_consistency_audit.mjs");
  }
}

async function promptForConfirmation(message) {
  if (process.stdin.isTTY) {
    const readline = require('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(`${message} (y/N) `, answer => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  } else {
    // Non-interactive mode, default to NO
    console.warn("Non-interactive mode, defaulting to NO for confirmation prompts");
    return false;
  }
}

seedSteps().catch((error) => {
  console.error("Unhandled error during seeding script execution:", error);
  process.exit(1);
});
