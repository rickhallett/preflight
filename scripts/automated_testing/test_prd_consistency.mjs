#!/usr/bin/env bun
import { auditPrdConsistency } from "../prd_consistency_audit.mjs";

/**
 * Automated test script for PRD consistency
 * 
 * This script runs the PRD consistency audit and reports success/failure based on the results.
 * It's designed to be integrated into CI/CD pipelines to ensure PRD consistency.
 */
async function runTest() {
  console.log("Running PRD consistency test...");

  try {
    const auditResult = await auditPrdConsistency();

    if (auditResult.nonCompliantCount > 0) {
      console.error(`❌ Test FAILED: Found ${auditResult.nonCompliantCount} non-compliant PRDs`);
      console.error("See audit_report.csv for details");
      process.exit(1);
    } else {
      console.log(`✅ Test PASSED: All ${auditResult.compliantCount} PRDs are compliant with their implementations`);
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Test ERROR: Failed to run PRD consistency audit", error);
    process.exit(2);
  }
}

// Run the test if executed directly
if (process.argv[1] === import.meta.url) {
  runTest();
}

export { runTest }; 