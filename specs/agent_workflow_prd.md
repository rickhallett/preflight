Okay, here is an updated `agent_workflow.md` file reflecting the current project state and outlining the autonomous process for implementing the questionnaire steps based on the PRD files.

```markdown
---
id: agent-workflow
title: Agentic PreFlight Intake MVP - PRD Implementation Workflow
version: 1.3 # Updated version
packageManager: bun
specPaths:
  - /specs/mvp_spec.md
  - /specs/prds/README.md
  - /specs/prds/step-*.md
status: active # Reflects the next phase
---

> **Purpose** Orchestrate an autonomous coding agent to iteratively implement the questionnaire steps defined in `/specs/prds/`. The core infrastructure is assumed to be complete. The agent will handle backend data seeding, frontend UI updates, unit & integration testing, verification, and committing for each step. All scripts use **Bun** exclusively.

---

## Spec Locations
| Path                     | Description                         |
| ------------------------ | ----------------------------------- |
| `/specs/mvp_spec.md`     | High-level MVP spec (Reference)     |
| `/specs/prds/README.md`  | Overview & Tiering of PRD steps   |
| `/specs/prds/step-*.md`  | Individual Step PRDs (Input Source) |
| `/specs/architecture.md` | To be updated before commits      |
| `/.cursorrules`          | Agent coding/commit guidelines    |

---

```json
{
  "workflow_name": "Agentic PreFlight - PRD Implementation (Bun)",
  "version": "1.3",
  "workflow_definition": [
    {
      "phase_id": 0,
      "phase_name": "Planning & Preparation",
      "goal": "Identify PRDs, plan data seeding, and verify environment.",
      "status": "pending",
      "is_automated": true,
      "steps": [
        {
          "step_id": "P0_1",
          "action": "List PRD Files",
          "description": "Identify all `/specs/prds/step-*.md` files to be processed. Store list (e.g., in memory or temp file), potentially ordering by tier based on README.",
          "output": "list_of_prd_paths"
        },
        {
          "step_id": "P0_2",
          "action": "Plan Data Seeding Strategy",
          "description": "Decide HOW step data from PRDs will be added to Convex `steps` table (e.g., modify `convex/steps.ts::seedSteps`, create standalone migration script, read from consolidated JSON). Log the chosen strategy.",
          "output": "seeding_strategy_plan"
        },
        {
          "step_id": "P0_3",
          "action": "Verify Environment",
          "description": "Run `bun install`, `bun run lint`, `bun run test` to ensure the current state is clean."
        },
        {
          "step_id": "P0_4",
          "action": "Commit Preparation",
          "description": "Git stage necessary files. Commit `chore(planning): prepare for PRD implementation`.",
          "preconditions": ["P0_3 passed"]
        }
      ],
      "phase_output": "list_of_prd_paths, seeding_strategy_plan"
    },
    {
      "phase_id": 1,
      "phase_name": "PRD Implementation Loop",
      "goal": "Implement each questionnaire step, test thoroughly, and commit.",
      "status": "pending",
      "is_automated": true,
      "trigger_input": "list_of_prd_paths, seeding_strategy_plan",
      "steps": [
        {
          "step_id": "P1_LOOP",
          "action": "Iterate PRDs",
          "loop_variable": "prd_file_path",
          "loop_source": "list_of_prd_paths",
          "sub_steps": [
            {
              "step_id": "P1_PARSE",
              "action": "Parse PRD",
              "description": "Read YAML front matter and description from `prd_file_path`. Extract requirements: `id`, `prompt`, `input_type`, `options`, `convex_step_type`, `convex_answer_validator`, `ui_component_suggestion`, etc."
            },
            {
              "step_id": "P1_SEED_BACKEND",
              "action": "Implement Seeding/Migration",
              "description": "Execute the chosen `seeding_strategy_plan` to add/update the step data in Convex based on parsed PRD. Run `npx convex dev --once` if schema or functions were modified."
            },
            {
              "step_id": "P1_CODE_FRONTEND",
              "action": "Update Wizard UI",
              "description": "Modify `src/QuestionnaireWizard.tsx` to correctly render the UI component (e.g., Textarea, Select, CheckboxGroup, Slider) based on parsed `input_type`. Add component imports if necessary. Ensure form state handles the new input type correctly."
            },
            {
              "step_id": "P1_TEST_UNIT",
              "action": "Write/Update Unit Tests",
              "description": "Add/modify Vitest unit tests in `tests/` for any new frontend logic or components added in `QuestionnaireWizard.tsx`."
            },
            {
              "step_id": "P1_TEST_INTEGRATION",
              "action": "Write/Update Integration Tests",
              "description": "Add/modify Vitest integration tests (mocking Convex client) to verify user interaction with the new UI element triggers `saveAnswer` with the correct data structure and `stepId`."
            },
            {
              "step_id": "P1_VERIFY",
              "action": "Run Verification Checks",
              "description": "Execute `bun run lint && bun run test`. Retry fixes max 2 times on failure."
            },
            {
              "step_id": "P1_ARCH_UPDATE",
              "action": "Update Architecture Doc (if needed)",
              "description": "Based on changes in this iteration, update `specs/architecture.md` as per `.cursorrules` policy.",
              "preconditions": ["P1_VERIFY passed"]
            },
            {
              "step_id": "P1_COMMIT",
              "action": "Commit Step Implementation",
              "description": "Create an atomic Conventional Commit. Extract `id` from parsed PRD. Message: `feat(questionnaire): implement ${prd_id}`. Example: `feat(questionnaire): implement step-08-budget-procurement`",
              "preconditions": ["P1_VERIFY passed", "P1_ARCH_UPDATE completed"]
            }
          ],
          "exit_condition": "All PRDs processed successfully or max retries exceeded on a step."
        }
      ],
      "phase_output": "Implemented questionnaire steps with passing tests."
    },
    {
      "phase_id": 2,
      "phase_name": "Polish & Finalisation",
      "goal": "Apply final formatting.",
      "status": "pending",
      "is_automated": true,
      "trigger_input": "Phase 1 completed successfully",
      "steps": [
        {
          "step_id": "P2_FORMAT",
          "action": "Run Auto-Formatting",
          "description": "Execute `bun run lint --fix` and potentially `bunx prettier --write .` (if Prettier is configured separately)."
        },
        {
          "step_id": "P2_COMMIT",
          "action": "Commit Formatting",
          "description": "Commit changes with message `style(format): apply automated formatting`."
        }
      ],
      "phase_output": "Formatted codebase."
    },
    {
      "phase_id": 3,
      "phase_name": "Final Human Review",
      "goal": "Present implemented steps for approval.",
      "status": "pending",
      "is_automated": false,
      "trigger_input": "Phase 2 completed successfully",
      "steps": [
        {
          "step_id": "HR_PACKAGE",
          "action": "Summarize Work",
          "description": "List implemented PRDs and link to commits. Highlight any issues encountered."
        },
        {
          "step_id": "HR_NOTIFY",
          "action": "Request User Review",
          "description": "Notify the user that the PRD implementation phase is complete and ready for review."
        },
        {
          "step_id": "HR_WAIT",
          "action": "Wait for Approval",
          "description": "Pause workflow execution until user provides explicit approval or requests changes."
        }
      ],
      "phase_output": "approval_status"
    }
  ]
}
```

---
### Bun Command Mapping
| Task                    | Bun command      |
| ----------------------- | ---------------- |
| Install deps            | `bun install`    |
| Add dep                 | `bun add <pkg>`  |
| Run script              | `bun run <name>` |
| Exec bin                | `bunx <bin>`     |
| Run linter              | `bun run lint`   |
| Run tests               | `bun run test`   |
| Update Convex Functions | `npx convex dev --once` |

### Conventional Commit Reminder
All commits must be atomic and follow Conventional Commits (`type(scope): subject`).


**Explanation of Changes:**

1.  **Title & Version:** Updated to reflect the new focus and incremented version.
2.  **Purpose:** Rewritten to clearly state the goal of implementing PRDs.
3.  **Spec Locations:** Added relevant PRD files and `.cursorrules`.
4.  **Phase 0 (Planning & Preparation):**
    *   Focuses on identifying the PRD files (`P0_1`).
    *   Adds an explicit step to *plan* the data seeding strategy (`P0_2`) before starting implementation.
    *   Keeps environment verification (`P0_3`) and a planning commit (`P0_4`).
5.  **Phase 1 (PRD Implementation Loop):**
    *   The loop now iterates over the `list_of_prd_paths` generated in Phase 0.
    *   **Sub-steps refined:**
        *   `P1_PARSE`: Specifically parses the PRD file.
        *   `P1_SEED_BACKEND`: Executes the seeding plan, includes running `convex dev --once`.
        *   `P1_CODE_FRONTEND`: Updates the wizard UI specifically.
        *   `P1_TEST_UNIT`: Explicitly for frontend unit tests.
        *   `P1_TEST_INTEGRATION`: Added for testing the UI interaction with the (mocked) backend mutation.
        *   `P1_VERIFY`: Runs both lint and *all* tests. Includes a simple retry concept.
        *   `P1_ARCH_UPDATE`: Added *before* commit to comply with `.cursorrules`.
        *   `P1_COMMIT`: Uses the parsed PRD ID for a specific commit message.
6.  **Phase 2 (Polish & Finalisation):** Simplified to just formatting, as documentation updates are less critical after this phase compared to the initial setup.
7.  **Phase 3 (Human Review):** Remains largely the same, but focuses on presenting the implemented steps.
8.  **Bun Command Mapping:** Added `lint` and `test` run commands for clarity. Added `npx convex dev --once` for backend updates.
9.  **Conventional Commit Reminder:** Kept for emphasis.

This workflow provides a more detailed and accurate plan for the agent's next autonomous task.