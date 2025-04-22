---
id: agent-workflow
title: Agentic PreFlight Intake MVP Workflow
version: 1.2
packageManager: bun
specPaths:
  - /specs/mvp_spec.md
  - /specs/*.md
status: draft
---

> **Purpose**  Orchestrate an autonomous coding agent that iteratively implements the PreFlight Intake MVP. The repository already exists; no repo‑initialisation is necessary. All scripts use **Bun** exclusively. E2E automation will be added in a later phase.

---

## Spec locations
| Path | Description |
|------|-------------|
| `/specs/mvp_spec.md` | High‑level MVP spec (Phase A, static flow). |
| `/specs/<feature>_spec.md` | One per feature expansion. |

---

```json
{
  "workflow_name": "Agentic PreFlight Intake MVP Development (Bun)",
  "version": "1.2",
  "workflow_definition": [
    {
      "phase_id": -1,
      "phase_name": "Specification Confirmation",
      "goal": "Confirm scope and spec locations.",
      "status": "pending",
      "is_automated": false,
      "steps": [
        { "step_id": "S0_0", "action": "List Spec Files", "description": "Enumerate /specs/*.md" },
        { "step_id": "S0_1", "action": "Summarise & Confirm", "description": "Summarise goals, tech, success criteria; WAIT for user OK." },
        { "step_id": "S0_2", "action": "Store Final Spec", "description": "Cache /specs/mvp_spec.md for later reference." }
      ],
      "phase_output": "/specs/mvp_spec.md"
    },
    {
      "phase_id": 0,
      "phase_name": "Environment Setup & Planning",
      "goal": "Install deps with Bun and generate an implementation plan.",
      "status": "pending",
      "is_automated": true,
      "trigger_input": "/specs/mvp_spec.md",
      "steps": [
        { "step_id": "P0_1", "action": "Parse Specs & Extract Tasks" },
        { "step_id": "P0_2", "action": "Ensure Dependencies Installed", "description": "Run `bun install`. Add vitest etc. with `bun add`." },
        { "step_id": "P0_3", "action": "Create Vitest Config" },
        { "step_id": "P0_4", "action": "Plan Implementation", "description": "Write JSON task list to /specs/implementation_plan.json" },
        { "step_id": "P0_5", "action": "Commit Setup", "description": "Conventional commit `chore(setup): bun deps & plan`" }
      ],
      "phase_output": "/specs/implementation_plan.json"
    },
    {
      "phase_id": 1,
      "phase_name": "Incremental Implementation",
      "goal": "Build backend and wizard UI with Bun‑run tests.",
      "status": "pending",
      "is_automated": true,
      "trigger_input": "/specs/implementation_plan.json",
      "steps": [
        {
          "step_id": "P1_LOOP",
          "action": "Iterate Tasks",
          "loop_variable": "task",
          "loop_source": "/specs/implementation_plan.json (Phase 1)",
          "sub_steps": [
            { "step_id": "P1_CODE", "action": "Write Code" },
            { "step_id": "P1_TEST", "action": "Add/Update Vitest test" },
            { "step_id": "P1_RUN", "action": "Execute `bun run lint && bun run test`" },
            { "step_id": "P1_DECIDE", "action": "If tests pass, commit; else attempt fix twice." }
          ],
          "exit_condition": "All Phase 1 tasks green"
        }
      ],
      "phase_output": "Feature‑complete code with passing unit tests"
    },
    {
      "phase_id": 2,
      "phase_name": "Polish & Docs",
      "goal": "Clean codebase and update README.",
      "status": "pending",
      "is_automated": true,
      "trigger_input": "Feature‑complete code",
      "steps": [
        { "step_id": "P2_FORMAT", "action": "Run `bun run lint --fix` & Prettier" },
        { "step_id": "P2_DOCS", "action": "Update README with bun usage & commit policy" },
        { "step_id": "P2_COMMIT", "action": "Commit `docs(readme): bun usage & workflow`" }
      ],
      "phase_output": "Polished code & README"
    },
    {
      "phase_id": 3,
      "phase_name": "Final Human Review",
      "goal": "Present finished MVP for approval.",
      "status": "pending",
      "is_automated": false,
      "trigger_input": "main branch green",
      "steps": [
        { "step_id": "HR_PACKAGE", "action": "Bundle code, tests, docs" },
        { "step_id": "HR_NOTIFY", "action": "Ask user for final approval" },
        { "step_id": "HR_WAIT", "action": "WAIT for response" }
      ],
      "phase_output": "approval_status"
    }
  ]
}
```

---
### Bun command mapping
| Task | Bun command |
|------|-------------|
| Install deps | `bun install` |
| Add dep      | `bun add <pkg>` |
| Run script   | `bun run <name>` |
| Exec bin     | `bunx <bin>` |

### Conventional Commit reminder
All commits must be atomic and follow Conventional Commits (`type(scope): subject`).

