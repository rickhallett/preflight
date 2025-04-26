Below is a **mini-PRD “feature sheet”** for **Project Pre-Flight**.  
Each feature is written in crisp PRD language ( *“Benefit → Requirement → Metric”* ) so you can lift sections straight into your own doc or backlog.

---

## 1 Self-service Readiness Survey (≤ 10 min)

|  |  |
|---|---|
| **Benefit** | Clinics discover blind-spots without paying a consultant. Low friction → higher top-of-funnel. |
| **Functional reqs** | • ≤ 25 multiple-choice questions in plain-English clinician language.<br>• Must cover four pillars: People, Process, Data, Tech.<br>• Progress bar & autosave. |
| **Success metric** |  ≥ 70 % of visitors who start the survey finish it. |

---

## 2 Instant Personalised Scorecard (PDF/HTML)

|  |  |
|---|---|
| **Benefit** | Gives immediate value; positions you as an expert; creates lead magnet. |
| **Functional reqs** | • 0-to-100 score and pillar sub-scores.<br>• Colour-coded quadrant chart.<br>• Three “do-this-week” actions auto-picked from rule-set.<br>• Export as PDF in <10 s. |
| **Success metric** |  ≥ 60 % download or email the report (proxy for engagement). |

---

## 3 Peer-benchmark Leaderboard

|  |  |
|---|---|
| **Benefit** | Clinics see how they rank vs similar-size peers → fear of falling behind drives upsell. |
| **Functional reqs** | • Anonymised percentile band (e.g., “You are in 62nd percentile vs UK clinics &lt; 25 staff”).<br>• Filters: country, size-band, specialty (GP, dentistry, physio). |
| **Success metric** |  ≥ 30 % click “See full benchmark” → leads capture page. |

---

## 4 Pain-point Heat-Map

|  |  |
|---|---|
| **Benefit** | Surfaces quick-win automation areas (documentation, triage, patient comms). |
| **Functional reqs** | • Survey includes 5 Likert questions on time-waste areas.<br>• Heat-map overlays pain vs feasibility; auto-labels top 2 opportunities. |
| **Success metric** |  ≥ 40 % of users rate the heat-map “useful” in post-survey poll (thumbs-up). |

---

## 5 Fixed-fee Micro-Consult Upsell

|  |  |
|---|---|
| **Benefit** | Monetises immediately without scaring smaller clinics with large retainers. |
| **Functional reqs** | • Call-to-action in scorecard: “Book a 2-hour roadmap session – £850”.<br>• Calendly integration; payment via Stripe.<br>• Session template auto-populates with clinic answers. |
| **Success metric** |  ≥ 5 % of completed surveys convert to paid call in first 90 days. |

---

## 6 Aggregate “AI-Clinic Readiness Barometer” (Thought-leadership Report)

|  |  |
|---|---|
| **Benefit** | PR & SEO engine; drives inbound leads; positions you against Deloitte/HIMSS. |
| **Functional reqs** | • Batch-export aggregated (de-identified) data quarterly.<br>• Auto-generate charts & key insights.<br>• Publish blog + downloadable PDF. |
| **Success metric** |  ≥ 1 000 unique page views per report; 50 new survey starts within 7 days of release. |

---

## 7 Lightweight Admin Dashboard

|  |  |
|---|---|
| **Benefit** | Lets you track funnel metrics and identify high-intent leads (score ≥ 75). |
| **Functional reqs** | • Daily data push to *task manager audit* Google Sheet.<br>• Columns: date, clinic size, total score, pillar scores, conversion flag.<br>• Red highlight for scores < 40. |
| **Success metric** | Internal use only; dashboard latency < 24 h. |

---

### MVP cut / V1 launch

| **Included** | **Deferred (V2+)** |
|---|---|
| • Features 1–3 (survey, scorecard, benchmarking) | • Heat-map visual<br>• Micro-consult checkout<br>• Quarterly barometer<br>• Admin dashboard prettification |

### Open questions for you

1. **Pricing** – Is £850 the right anchor for a 2-hr consult, or do you prefer tiered offers?  
2. **Data storage** – Any constraints (NHS DSPT, HIPAA) that dictate UK-only hosting?  
3. **Brand tone** – Formal clinical language vs friendly “digital health check-up”?

Let me know which sections you’d like expanded (e.g., question bank, flowchart, data model) and I’ll flesh those out next.