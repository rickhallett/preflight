---
id: mvp-spec
title: PreFlight Intake MVP
phase: A
status: draft
tech:
  frontend: React 19 + Vite + Tailwind + shadcn/ui
  backend: Convex 1.21 (alpha)
  packageManager: bun
  auth: email‑password • magic‑link (ConvexAuth)
  payments: none  # Stripe paywall postponed to Phase B
metrics:
  targetCompletionRate: 0.75  # 75 % of started intakes complete
  targetAvgStepTimeSec: 20
---

# PreFlight Intake — Phase A Specification

**Goal**  Ship a free, static questionnaire that collects authentic user input and early‑stage feedback, priming later adaptive and paid phases.

---
## 1  Scope
* Anonymous sign‑in defaults to **`paid`** role for friction‑free access.
* Email + password signup also enabled to capture qualified leads.
* **Home dashboard**
  * CTA: **Start new questionnaire**.
  * List of previously completed intakes (sortable by date).
  * Delete button ➜ modal confirm ➜ hard‑delete answers & questionnaire rows.
* **Questionnaire flow**
  * Ordered steps read from Convex `steps` table.
  * One prompt per screen; components chosen by `type` (text, radio, slider).
  * Skip, Back, Next controls; progress bar.
  * Final screen writes `completedAt` then returns to dashboard.
* Convex schema, React wizard UI, vitest unit tests; no paywall, no cron, no E2E.

## 2  Non‑Goals (Phase A)
* LLM‑generated or conditional questions.
* Payment processing or role upgrades.
* Mobile‑specific styling beyond responsive Tailwind defaults.
* Automated E2E tests.

## 3  User Stories
| ID | Role | Want | So that |
|----|------|------|---------|
| US‑1 | Visitor | Start the intake instantly | I can see value before committing |
| US‑2 | User | View previous submissions | I can review or reuse information |
| US‑3 | User | Delete a past questionnaire | I control my stored data |
| US‑4 | Admin | Inspect raw answers in Convex dashboard | I can audit data quality |

## 4  Data Model (Convex `schema.ts`)
```ts
users          { _id, email?, role: "guest"|"paid"|"admin" }
questionnaires { _id, userId, startedAt, completedAt? }
steps          { _id, questionnaireId, index, type, prompt, options? }
answers        { _id, stepId, value, skipped }
```

## 5  Acceptance Criteria
* **vitest** coverage ≥ 95 % for schema validators and React wizard logic.
* `bun run lint` passes with zero errors.
* Manual smoke test: sign up → start → complete → dashboard shows entry → delete entry.

## 6  Risks & Mitigations
* **Drop‑off** – cap questionnaire at ≤ 10 steps; show real‑time progress.
* **Email spam** – server‑side rate‑limit sign‑ups; send verification email in Phase B.
* **Bun quirks** – fall back to Node for Convex CLI only if blocking bug appears.

## 7  Future Phases
* **Phase B:** Stripe paywall, reminder cron job, admin email notifications.
* **Phase C:** LLM‑generated follow‑up questions, live admin review UI.
* **Phase D:** Analytics dashboards, HIPAA compliance, PWA packaging.

---
End of spec.













# Project PreFlight Intake — MVP Specification


> **Objective**   
> Deliver a production‑ready, static multi‑step medical‑intake wizard that onboards users rapidly, gathers real answers, and seeds the data needed for later AI‑driven personalisation. The MVP is free‑to‑use to minimise friction and maximise feedback while we validate product‑market fit.

---
## 1  Business & Product Rationale
* **Lean‑startup first** – Ship a Minimal Viable Product to learn from real usage instead of guessing feature needs.  
* **Freemium launch** – Offering the core flow free removes the paywall friction that can suppress early adoption, while keeping upgrade paths open for future paid tiers.  
* **Healthcare onboarding UX** – Short, progressive steps improve completion and trust in health apps.

---
## 2  Tech Stack (Fixed for Phase A)
| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | React 19 + Vite, Tailwind, shadcn/ui | Modern DX, React‑hook‑form wizard patterns. |
| **State & DB** | Convex 1.21‑alpha | Real‑time reactive DB, simple auth + cron. |
| **Auth** | Convex email‑password (magic‑link later) | Collect real emails for leads; upgrade path to OAuth. |
| **Payments** | Stripe (Checkout, free‑trial flag off) | Infrastructure ready for tiers; unused in Phase A. |
| **Testing** | Vitest + Playwright (unit/int only in Phase A) | Fast JS/TS tests; E2E deferred. |

---
## 3  Phase A — Static MVP Feature List
### 3.1 User Roles & Auth
* **Anonymous sign‑in → auto‑role `paid`** so that first‑time visitors land directly in the wizard.  
* **Email & password upgrade** (optional) to capture leads for re‑engagement; stored securely via Convex Auth.

### 3.2 Core Flows
1. **Home / Dashboard**  
   * Header, welcome copy, CTA to *Start new questionnaire*.  
   * List of completed questionnaires with **delete** (soft‑delete flag) and confirmation modal.  
2. **Start Questionnaire**  
   * Creates `questionnaire` row and redirects to step 0.  
3. **Wizard**  
   * One step per screen; `Next`, `Back`, `Skip`. Progress bar.  
   * Local zod validation; server mutation persists answer.  
4. **Finish**  
   * Thank‑you screen + “Return Home”. Questionnaire marked `completedAt`.

### 3.3 Data Schema
| Table | Key fields |
|-------|------------|
| users | `email`, `role`, `createdAt` |
| questionnaires | `userId`, `startedAt`, `completedAt?` |
| steps | `questionnaireId`, `index`, `type`, `prompt`, `options?` |
| answers | `stepId`, `value`, `skipped` |

### 3.4 UI/UX Principles
* Progressive disclosure to avoid overwhelm.  
* Mobile‑first layout; 1‑finger navigation.  
* HIPAA‑friendly copy: warn email is not secure for PHI.

### 3.5 Non‑Functional Requirements
* **Performance** – First contentful paint < 2 s on 4G mobile.  
* **Security** – Passwords hashed via Convex; TLS enforced.  
* **Compliance** – No PHI storage outside Convex tables; plan for HIPAA BAA phase.

### 3.6 Testing Scope
* **Unit tests** – Validation rules, Convex mutations.  
* **Integration tests** – Wizard step navigation & data persistence via mocked Convex client.  
* **Skip E2E** – Playwright scaffolding only, executed in later phase.

### 3.7 Deliverables
* Passing CI pipeline (lint, unit, int).  
* Atomic Conventional Commits.  
* README with setup and contribution guide.

---
## 4  Phase B — Adaptive Enhancements
* **AI‑generated follow‑ups** using OpenAI function‑calling to propose next questions dynamically.  
* **Analytics dashboard** for completion/drop‑off, leveraging Convex queries.  
* **Email reminders** via Convex cron + Resend.

---
## 5  Phase C — Monetisation & Compliance
* **Paid tier switch‑on** – Stripe Checkout with $X plan or free‑trial days.  
* **Granular roles** (`free`, `trial`, `paid`, `admin`).  
* **HIPAA BAA storage migration** if needed.

---
## 6  Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Low early adoption even when free | Gamify feedback, user‑testing loop. |
| Questionnaire abandonment | Progressive disclosure & auto‑save. |
| Freemium abuse | Rate‑limit wizard creation; soft cap per user. |

---
## 7  Acceptance Criteria (Phase A)
1. New anonymous visitor can complete questionnaire end‑to‑end in <5 min.  
2. Data visible in dashboard instantly.  
3. Unit + integration tests green in CI.  
4. Core flows documented in README.

---
**End of spec.**


