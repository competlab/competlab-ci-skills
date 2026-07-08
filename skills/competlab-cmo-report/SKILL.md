---
name: competlab-cmo-report
description: |
  Orchestrator skill. Composes a complete CMO report for a CompetLab project by sequencing all dimension dashboards + on-demand research skills (status-watch, funding-watch, ai-ecosystem, hiring-signals, agent-adoption, product-watch, customer-voice-snapshot) + URL Verification middleware + the layered backing-docs synthesis. Output: 1 main report (L3) + 12 per-dimension docs (L2 — 4 dashboard-derived + 8 sub-skill-derived) + per-Tier-1-competitor deep dives (L2) + per-Tier-2-light-recon for monitoring-suggestions, with two-axis cross-references between docs. Use when the user asks for "CMO report", "strategic briefing", "Itrinity briefing", "full competitive analysis for [project]", "cold-start briefing". Replaces manual sequencing of individual skills with a single one-command run.
effort: high
license: MIT
compatibility: Requires the CompetLab MCP server (`mcp__competlab__fetch_url`) + Perplexity MCP. All sub-skills (status-watch, funding-watch, ai-ecosystem, hiring-signals, agent-adoption, product-watch, customer-voice-snapshot, ai-visibility, landscape, competitor-dive) must be installed.
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_competitor mcp__competlab__get_briefing mcp__competlab__list_alerts mcp__competlab__get_ai_visibility_dashboard mcp__competlab__get_ai_visibility_trend mcp__competlab__get_ai_visibility_history mcp__competlab__get_tech_trust_dashboard mcp__competlab__get_content_dashboard mcp__competlab__get_content_changelog mcp__competlab__get_positioning_dashboard mcp__competlab__get_pricing_dashboard mcp__competlab__fetch_url Bash WebSearch mcp__perplexity__perplexity_ask
metadata:
  author: competlab
  version: "2.0.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# CMO Report — Orchestrator

You are the orchestrator that composes a complete CMO report for a CompetLab project. The output is **NOT a single document** — it's a navigable knowledge base: 1 main report (L3) + 12 dimension reports (L2 — 4 dashboard-derived + 8 sub-skill-derived) + 3-5 competitor deep-dives (L2), with two-axis cross-references and a Monitoring Suggestions section informed by AI-visible-but-unmonitored cheap recon.

This is the killer feature of the CompetLab Skills suite. A single command produces decision-grade output that previously required a senior analyst spending half a day.

## Orientation

Your customer's competitive intelligence foundation is CompetLab's 5-dimension monitoring + continuous AI Visibility tracking — structured, hard-to-replicate signal across positioning, pricing, content, tech-trust, and AI-discoverability surfaces. Your job: extract maximum strategic value from that foundation, extending with web research where it adds depth, and deliver a CMO-grade briefing the customer can act on Monday.

Your audience is a CMO with 15 minutes. Everything you write earns its place by being a strategic insight about their brand, competitors, or AI Visibility position. Everything in the deliverable travels into their decision-making.

Real-world competitive surfaces are always partial — some vendors bot-protect their site, some categories don't surface on G2, some pages JS-render their pricing. When data on a dimension is partial, that partiality is itself competitive signal: a vendor invisible to your scan is also invisible to AI training crawlers, comparison-engine bots, and agent toolkits — material AI Visibility consequence for them, opportunity for you to surface where your customer is differently positioned. Extract the strategic finding from what you observe; verify via alternative channels where it adds confidence; ship the value.

When two data sources show different signals about the same surface, use the one with deeper probe-depth — direct probes outweigh heuristic summaries, recent scrapes outweigh older ones. This is normal analyst discipline: cross-check sources, lead with the most credible signal. Your briefing carries the conclusion, not the cross-check process.

Your customer-visible deliverables: `briefing.md`, the dimension docs, the competitor docs, `README.md`. Your working state lives in `_internal/` during the run — keep it there so it stays available if you extend the analysis with follow-up questions.

## Arguments

- `projectId` (required) — the CompetLab project to brief on
- `--output-folder=<path>` (optional, defaults to `cmo-reports/{project-slug}-{date}/`). `project-slug` is derived from `get_project.slug` field, or falls back to a kebab-case slugify of `get_project.name`.

## Bash usage scope

This skill declares `Bash` in `allowed-tools` for ONE specific purpose: JSON-RPC POST verification of MCP server claims via `curl -sS -X POST` against URLs surfaced by `start_agent_adoption_scan` or `get_content_dashboard` (per `PATTERN-url-verification.md` § MCP-server-claim sub-pattern). The pattern is:

```bash
curl -sS -X POST "<verified-candidate-url>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",...}'
```

**Do NOT use Bash for:** filesystem mutation, package installation, fetching arbitrary URLs (use `mcp__competlab__fetch_url` instead), or any other purpose. The narrow scope is non-negotiable for production use.

## Workflow

### Phase 0 — Pre-flight (1-2 minutes)

**MANDATORY READING BEFORE PHASE 1 (in order):**
1. `PATTERN-url-verification.md` — URL Verification discipline, including the MCP-server JSON-RPC POST sub-pattern + the discovery-vs-capability carve-out
2. **`KNOWLEDGE-platform-mechanics-and-failures.md`** — how each CompetLab dimension check works, what failure modes look like, cascade-map between dimensions, and how to interpret scan failures as customer-facing strategic findings rather than methodology noise. **Without this, the orchestrator misses ~30% of the strategic insight available in a typical run.**
3. `TEMPLATE-briefing.md` + `TEMPLATE-dim-doc.md` + `TEMPLATE-comp-doc.md` — doc-shape templates

**Install-path discovery (where these companion docs live):** these shared docs live at the **`.claude/skills/`** root level (alongside other skill folders), NOT inside the `competlab-cmo-report/` skill subfolder. Read them via paths like:
- `{skills_root}/PATTERN-url-verification.md`
- `{skills_root}/KNOWLEDGE-platform-mechanics-and-failures.md`
- `{skills_root}/TEMPLATE-briefing.md`
- `{skills_root}/TEMPLATE-dim-doc.md`
- `{skills_root}/TEMPLATE-comp-doc.md`

Where `{skills_root}` is typically `.claude/skills/` (project install) or `~/.claude/skills/` (user install). If you can't find them at the expected paths, run `Glob({pattern: "**/PATTERN-url-verification.md"})` to discover the actual install location. Reading all 5 companion docs sequentially consumes ~12-15k tokens — expected overhead before project work begins.

Then execute Phase 0:

0. **Sub-skill discovery check** — run `Glob({pattern: "**/competlab-*/SKILL.md"})` to confirm the expected 13 skills are installed (5 existing: landscape, weekly-briefing, competitor-dive, ai-visibility, battlecard; 8 new: status-watch, funding-watch, ai-ecosystem, hiring-signals, agent-adoption, product-watch, customer-voice-snapshot, cmo-report). If any are missing, document in PRE-FLIGHT.md and produce a degraded-coverage briefing with explicit gap notes in the relevant dim docs (rather than silently producing partial output).
1. Pull `list_projects` + `get_project` for project context + data freshness check
2. Pull `list_competitors` for monitored set
3. Pull `get_ai_visibility_dashboard` to identify Tier-2 candidates (AI-visible-but-unmonitored brands ranked above strategic-relevance threshold). **Cross-provider consistency check** (banked from real-world validation): when ranking candidates by aiScore, also check the per-provider mention pattern. A vendor with aiScore N driven entirely by a single provider (e.g., mentioned by OpenAI only, absent in Claude + Gemini) is a less stable candidate than a vendor with lower aiScore surfacing across 2+ providers — the second represents broader buyer recognition while the first may be category-classifier-edge-case in a single LLM. Prefer cross-provider-consistent candidates when ranked similarly. If a single-provider candidate is included, note the lens-specific position explicitly in PRE-FLIGHT.md.
4. Confirm fresh-enough data per dimension (note any stale dimensions in briefing header traffic-light)
5. Create `_internal/` folder for your orchestrator working state (raw skill outputs, research compilations, MCP probe logs, pre-flight scoping notes). Sub-skills don't read from `_internal/` — each sub-skill pulls its own data fresh per its workflow.
6. Write your pre-flight scoping notes to `_internal/_pre-flight-notes.md` (orchestrator-private — never referenced from customer-visible files), identifying:
   - All monitored competitors → primary deep-dive targets (full set per `list_competitors`)
   - Top-3 AI-visible-unmonitored → candidates for additional cheap-recon
   - Top-N+ AI-surfaced brands (positions 4-10 by AI Visibility Score) → appear in `dim-ai-visibility.md` as table rows with no further synthesis

### Phase 1 — Skill fan-out (parallel, ~5-10 min)

Run in parallel where possible. Each skill writes its output to `_internal/{skill-name}/` raw + structured.

**Parallel-polling pattern for async platform scans (banked from real-world validation):**

For `start_agent_adoption_scan`, `start_tech_stack_scan`, `start_trust_signals_scan` — these are async (30-90s per scan). To avoid serial wait:

1. **Fire ALL `start_*_scan` calls in a SINGLE tool-use message** (one assistant turn containing N parallel invocations). Collect all scanIds.
2. **Do NOT poll immediately.** Wait until you've done at least one substantive piece of work (~30-60s of orchestrator time) — read a doc, draft a section, fire sub-agent research. The scans need ≥30s to complete; polling sooner produces "queued" responses that consume tool-call budget without information gain.
3. **Then poll ALL `get_*_scan` calls in a SINGLE tool-use message** (one assistant turn with N parallel `get_*_scan` invocations matching the N scanIds). Most scans will be `completed` by then.
4. **A scan is done when `status === "completed"`.** For any `status === "queued"` or `status === "started"` responses, repeat step 3 in a new tool-use message ~30-60s later. Remove completed scanIds from the polling set.
5. **A scan may return `status === "failed"`** with `error: {code, message}` — common pattern: the underlying site is bot-protected (the customer's monitoring pipeline hit the same wall AI training crawlers, comparison-engine bots, and agent toolkits hit). Treat as data unavailability for that vendor — and treat the bot-protection itself as competitive signal about that vendor's AI-discoverability posture. In the relevant dim/comp doc, frame for the customer: *"vendor X is invisible to AI tooling — material AI Visibility consequence for them."* Don't mention scan internals or error codes in customer-visible output.
6. **Retry-loop bound.** If after 3 batch-polls some scans are still `queued` or `started`, log to `_internal/` and proceed with partial coverage — do NOT block the briefing on stragglers. Mark the unfinished vendors as "scan-in-progress / data unavailable this run" in the relevant dim/comp docs.

**Anti-patterns (do NOT do any of these):**
- ❌ Start scan 1 → poll until done (60s) → start scan 2 → poll until done (60s) ... serialized polling burns N × ~60s wall-clock. For 9 competitors × 3 scan types = 27 scans, serialized burns ~27 min wall-clock. Parallel collapses to ~60-90s.
- ❌ Use `ScheduleWakeup` or `sleep` loops between polls. The orchestrator works fine within a tool-call budget without sleep — just do other work between polls.
- ❌ Poll every 5-10s aggressively. Each poll is a tool call; you'll consume budget without information gain. Default to one batch poll at ~30-60s after starting, with one retry batch at +60s if any are still pending.

**Concrete example (12 async scans):**
- Assistant turn N: 12 `start_*_scan` calls in single tool-use block. ~2s wall-clock.
- Assistant turns N+1 through N+M: do other work — read templates, query dashboards, fire sub-agent research. ~30-60s.
- Assistant turn N+M+1: 12 `get_*_scan` calls in single tool-use block. Most return `completed`. ~5s wall-clock.
- (If any still queued/started:) Assistant turn N+M+2 after another ~30-60s of work: retry the remaining `get_*_scan` calls.

**Total wall-clock budget: ~120s for 12 async scans, parallel.** Serialized would be 12 × ~60s = 720s.

**Vertical-detection downweight rule (banked same source):**

After Phase 0 pre-flight, classify the project's vertical:
- **Enterprise B2B SaaS** (CRM, CS platforms, observability, payments) → run ALL 7 sub-skills full-depth
- **Bootstrapped-indie operator category** (hospitality, vacation rental, indie hosting tools, solo-founder AI tools) → DOWNWEIGHT `hiring-signals` + `funding-watch` + `customer-voice-snapshot` (these return categorical absences in this vertical class). Run them once-each as confirmation, halt on first 2-3 null returns.
- **AI / developer tools** → run ALL but expect heavy Reddit/HN signal in customer-voice (not G2/Capterra)

Saves ~30-50% of skill-fan-out wall time on bootstrapped-indie projects.

**For all Tier-1 monitored competitors (full skill suite):**
- `competlab-landscape` (one run, covers whole project)
- `competlab-ai-visibility` (one run, covers whole project)
- `competlab-status-watch` (per-competitor probe)
- `competlab-funding-watch` (per-competitor research, with URL verification on all citations)
- `competlab-ai-ecosystem` (per-competitor GitHub/npm/marketplace probe)
- `competlab-hiring-signals` (per-competitor multi-adapter ATS probe)
- `competlab-agent-adoption` (per-competitor MCP/llms.txt verification — **JSON-RPC POST per PATTERN-url-verification.md sub-pattern**)
- `competlab-product-watch` (per-competitor changelog scrape)
- `competlab-customer-voice-snapshot` (per-competitor G2/Capterra/Trustpilot snapshot via Perplexity, with URL verification)

**For Tier-2 candidates (cheap recon ONLY):**
- Run skill wrappers: `status-watch` + `funding-watch` (light pass) + `ai-ecosystem` (light) + `agent-adoption`
- **CRITICAL: also call CompetLab's existing per-domain platform scans** (these don't require pre-existing project monitoring — perfect for unmonitored brands):
  - `mcp__competlab__start_agent_adoption_scan(domain)` + poll `get_agent_adoption_scan` → 25-check Agent-Adoption Spec scan
  - `mcp__competlab__check_ai_crawlers(domain, industry)` → AI bot policy
  - `mcp__competlab__start_tech_stack_scan(domain)` + poll `get_tech_stack_scan` → 117-rule tech/growth/engagement stack scan
  - `mcp__competlab__start_trust_signals_scan(domain)` + poll `get_trust_signals_scan` → 34-signal trust analysis
- Skip: `hiring-signals` (expensive), `customer-voice-snapshot` (Perplexity-heavy), `product-watch` (per-vendor adapter friction)
- **Why the platform scans matter for Tier-2:** monitored competitors get their tech-trust + agent-adoption from the project dashboards (already pulled in Phase 0). Unmonitored competitors don't — but the on-demand platform scans give equivalent depth without monitoring setup, in 30-90s per scan.

### Phase 2 — Per-dimension synthesis (parallel, ~5 min)

**Incremental-writing rule** (banked from real-world validation): begin writing Tier-1 dim docs as soon as their constituent data is in. Don't block on sub-agents whose outputs feed DIFFERENT dim docs. Example: AI Viz / Positioning / Pricing / Content / Tech & Trust / Agent Adoption depend on platform-dashboard data that's available immediately after Phase 0. Writing those 6 dim docs in parallel with Phase 1 sub-agent fan-out (which feeds Funding / Hiring / Product / Customer Voice dim docs) saves orchestrator wall-time and keeps the parent's working context lean.

For each of the 12 dimensions (4 dashboard-derived + 8 sub-skill-derived), synthesize all Tier-1 + Tier-2 raw data into a single L2 dimension doc. **Use these exact filenames** (so future runs + cross-doc references stay consistent):

| Sub-skill / dashboard source | Dim doc filename |
|---|---|
| `competlab-landscape` (synthesis from dashboard data) | `dim-landscape.md` |
| `competlab-ai-visibility` (or `get_ai_visibility_dashboard`) | `dim-ai-visibility.md` |
| `competlab-agent-adoption` + agent-adoption-scan | `dim-agent-adoption.md` |
| `competlab-funding-watch` | `dim-funding-capital.md` |
| `competlab-hiring-signals` | `dim-hiring-gtm.md` |
| `competlab-product-watch` | `dim-product-launches.md` |
| `competlab-status-watch` | `dim-reliability-status.md` |
| `competlab-customer-voice-snapshot` | `dim-customer-voice.md` |
| `get_positioning_dashboard` | `dim-positioning.md` |
| `get_content_dashboard` | `dim-content.md` |
| `get_pricing_dashboard` | `dim-pricing.md` |
| `get_tech_trust_dashboard` + tech-stack-scan + trust-signals-scan | `dim-tech-trust.md` |
| `competlab-ai-ecosystem` | folded INTO `dim-agent-adoption.md` as a sub-section (external-vs-first-party signals) OR shipped as `dim-ai-ecosystem.md` standalone when ecosystem signal density is high enough to warrant its own doc |

(12 dim docs total — 8 new-skill ones + 4 traditional dashboard ones)

Each follows `TEMPLATE-dim-doc.md` shape: mini-thesis → per-competitor data → cross-competitor patterns → strategic implication → data freshness/caveats.

### Phase 3 — Per-Tier-1-competitor synthesis (parallel, ~5 min)

For each Tier-1 monitored competitor, aggregate all skill outputs filtered to that competitor + write `comp-{slug}.md` per `TEMPLATE-comp-doc.md` shape: mini-thesis → quick profile → per-dimension data → **cross-dimensional pattern callouts (the convergence paragraph shape — MANDATORY when 5+ dimensions converge)** → trajectory → implication.

### Phase 4 — Briefing synthesis (single pass, ~3-5 min)

Read all L2 dim docs + comp docs, extract synthesis patterns, write the L3 `briefing.md` per `TEMPLATE-briefing.md` shape:

- Header with data-freshness traffic light (✓/⚠/✗)
- Strategic Thesis (with "where unusually strong" + "where structurally exposed" lists)
- 3 macro shifts (each with concrete data + implication)
- Where [brand] sits today — honest mirror per dim (referencing L2 evidence, not re-pasting)
- **Mandatory convergence paragraph** for top 1-2 strategic competitors
- 3 strategic paths (A defensive / B offensive / C frontier) + Recommended combination
- Prioritized recommendations grouped by horizon (7d / 14d / 30d / 90d)
- **Cheapest high-leverage move callout sidebar** (1 specific 1-day-fix-with-disproportionate-impact item)
- **Monitoring Suggestions section** (output of Tier-2 light recon — "swap X for Y" with evidence)
- What this briefing didn't cover (acknowledged gaps)
- 3 Decision Questions (recommendation-altering, not generic clarifications)

### Phase 5 — Final QC (1-2 min)

1. **URL Verification final pass:** scan briefing.md + L2 docs for any URL citations that didn't get individually verified during their sub-skill run. POST any MCP-claim URLs via JSON-RPC; HEAD any other URLs via `mcp__competlab__fetch_url`.
2. **Anti-pattern scan:** check for hedged claims without evidence, generic recommendations without specifics, missing data-freshness markers.
3. **Decision Questions in briefing § 9:** ensure the 3-5 questions are surfaced cleanly in the briefing's Decision Questions section, self-contained enough that the CMO can quote the section into an email to delegate to team without re-explaining context.

### Phase 5.5 — Cross-source consistency check (silent, internal)

Before finalizing the briefing, scan your collected data for cases where two sources show different signals about the same underlying surface (e.g., robots.txt parsing, sitemap detection, security-header verdicts, pricing parseability).

This is normal analyst discipline — use the one with deeper probe-depth and lead with the most credible signal:

- **Direct probes outweigh heuristic summaries** — when one signal comes from careful per-vendor verification and another from a category-level summary, the direct probe wins.
- **Recent scrapes outweigh older ones** — when freshness differs, lead with the recent measurement.
- **Multi-source consensus outweighs singleton** — when ≥2 sources agree and one disagrees, lead with consensus.

Pick the more credible signal and use it in the briefing. The cross-check process stays in your working memory — your customer-visible deliverables carry the conclusion, not the verification chain. If you want to keep notes for your own audit-trail purposes during the run, record in `_internal/_reconciliation-notes.md` (orchestrator-private; never referenced from briefing / dim docs / comp docs / README).

**Common cross-source variance patterns** (use this as orientation for where to apply your consistency-check discipline; reflect these in the briefing as the FINDING about the customer's site or competitor, not as commentary on data sources):
- AI-crawler-policy summary differs from raw robots.txt parsing on sites that use path-scoped wildcards under `User-agent: *`. Lead with the direct robots.txt read; surface as customer-facing AI-bot-policy finding.
- Pricing data returns null while positioning data confirms pricing exists (free-trial copy, pricing page present). Use this as a parseability finding: pricing is invisible to automation → AI Viz pricing-comparison consequence → 1-day fix recommendation (static HTML pricing table).
- `marketAvgPrice` computed from a single-vendor sample (when most vendors in the project have non-extractable pricing). Don't surface `pricePositionPercent` against a single-source baseline; reframe as "limited cross-vendor pricing visibility — customer's pricing is unusually transparent for the category" if that's the actual signal.
- Main-domain content sitemap shows 0 docs while help-subdomain knowledge base exists. Surface as "help content lives on subdomain, not surfaced via main-domain sitemap → recommend cross-linking + sitemap inclusion to restore AI-discoverability."
- Status-page URL returns HTTP 200 with non-status content (SPA-catchall, locale-redirect serving homepage). Customer-facing finding: vendor's status page isn't actually functional → operational-maturity narrative liability if mentioned in your briefing.
- Positioning data shows German/locale-redirect content for an English-primary site (multilingual sites with IP-based geo-detection). Use the actual English-primary positioning if a sibling source has it; surface as "your site's English positioning is invisible from EU infrastructure → AI crawlers indexing from EU regions get the German version" if material.

**Vendor-relationship cross-check** (banked from real-world validation): for every monitored Tier-1 + AI-visible Tier-2 candidate, check whether the vendor appears in the customer's tech-stack detection (`get_tech_trust_dashboard.customer.technologyStack`). If YES — the customer is paying a competitor for infrastructure (e.g., customer uses competitor X for A/B testing infrastructure). This is a high-strategic-signal finding that doesn't have a first-class dimension yet — surface it prominently in the briefing (typically in the strategic-thesis exposure list AND in the relevant comp doc's mini-thesis). Future product roadmap: dedicated vendor-relationship-awareness dimension.

**When the customer's own site shows partial data on any dimension, that partiality is itself the strategic finding.** What's invisible to your monitoring pipeline is also invisible to AI Viz comparison queries, SEO crawlers, 3rd-party CI tools, agent toolkits making procurement decisions. Surface as "discoverable to humans, invisible to automation" — material AI Visibility consequence, drives a concrete strategic recommendation (e.g., "add static HTML pricing table alongside JS-rendered widget").

### Phase 5.6 — Tier-2 auto-promotion evaluation (banked from real-world validation)

Empirical pattern from validation runs: cold-instance orchestrators make implicit judgment promoting strategically-significant Tier-2 candidates from cheap-recon to full comp-doc deep-dive when cross-dim signal density is high. Encoding the judgment explicitly so future runs reach the same call:

For each Tier-2 candidate, evaluate against 4 criteria:

| Criterion | Pass threshold |
|---|---|
| AI Viz mention rate | **≥ median(surfaced brands' mention rates) OR ≥ 50%** — whichever is LOWER. (Handles small-set-vs-large-set cases consistently. In a category where the median mention rate is 22%, a Tier-2 candidate at 44% clearly passes "top half" even though it's below 50%. In a category where median is 60%, the 50% floor applies.) |
| AI Viz cross-provider consistency | mentioned in ≥ 2 of 3 LLM providers |
| Agent Adoption OR trust signal | platform agent-adoption score ≥ median(Tier-1 monitored) OR trust-signals tier ≥ "substantial" (30/100+) OR llms.txt detected |
| Strategic signal type | "blind spot" (Tier-2 outperforms ≥ 50% of monitored Tier-1) OR "category-redefining" (positioning frame challenges customer's category boundary) |

**Handling agent-adoption data unavailability in the Tier-1 median computation** (banked from real-world validation): if any Tier-1 monitored vendor has no readable agent-adoption signal (typically because their site is bot-protected → invisible to your monitoring AND to all other automated systems), EXCLUDE that vendor from the median computation rather than treating as null/zero. Rationale: the unavailability reflects the vendor's discoverability posture, not their agent-adoption capability — including them as low-scores would unfairly lower the Tier-1 median and over-promote Tier-2 candidates against an artificially-degraded baseline. (The bot-protection itself is still surfaced as a customer-facing finding in the relevant comp doc — it just doesn't enter the agent-adoption baseline math.)

**Decision:**
- **4/4 criteria** → AUTO-PROMOTE to FULL comp-doc + flag in Monitoring Suggestions as "auto-promoted; recommend Tier-1 monitoring upgrade"
- **3/4 criteria with strong-qualitative case** (signal type is "category-redefining" OR briefing-cited-by-name OR outperforms ≥50% of Tier-1 on ≥1 dimension) → FULL comp-doc
- **3/4 criteria with weaker-qualitative case** (signal type is "adjacent-enterprise context" — vendor competes for buyer mindshare but not direct procurement, e.g., a much-larger-segment player that shows up in AI Viz queries but isn't on customer's shortlist) → LITE comp-doc
- **2/4 criteria with strong qualitative case** (banked from real-world validation): NEW INTERMEDIATE TIER — "lite comp doc" (30-50 lines covering the 2-3 most strategically loaded dimensions, NO full convergence paragraph). Eligibility: candidate must hit BOTH (a) briefing-cited-by-name as category-redefining threat AND (b) outperforms ≥ 50% of Tier-1 monitored on ≥ 1 dimension AND (c) qualitative strategic relevance argues for monitoring. Handles the "qualitatively important but quantitatively borderline" case (e.g., free-tier-category-redefining vendor with low aiScore).
- **≤ 2 criteria (no qualitative exception)** → cheap-recon only; appears in Monitoring Suggestions; no comp-doc

**Tiebreaker when ≥2 candidates pass 3/4:** the qualitative-signal-type ranking is the landing-zone rule. Rank in order: (1) named-by-industry-analyst-leader-report > (2) recent M&A activity > (3) positioning-frame-direct-overlap-with-customer > (4) outperforms-Tier-1-on-≥1-dimension > (5) larger-review-base. Strongest qualitative signal → FULL comp-doc. Weaker qualitative signal → LITE comp-doc. Additional 3/4 candidates beyond the top 2 remain Tier-2 light-recon only.

Frame promotion in the comp doc's mini-thesis with positive customer-facing language — e.g., *"Not currently in your monitored set but warrants deep-dive given category leadership"* or *"Lower-priority candidate to consider adding to monitoring; included here for cheap-recon depth."* Avoid orchestrator-internal jargon (Tier-1 / Tier-2 / "auto-promoted per Phase 5.6") in any customer-visible text — that's working language for your own decision-making.

### Phase 6 — Output

Write to output folder (default `cmo-reports/{project-slug}-{YYYY-MM-DD}/`).

**Customer-visible deliverables** (the only files in the final folder):
- `briefing.md` — the main deliverable (L3 strategic synthesis with § 9 Decision Questions for delegation)
- `dim-*.md` — per-dimension docs (12 of them; one per dimension)
- `comp-*.md` — per-competitor deep dives (one per Tier-1 monitored competitor + any auto-promoted candidates)
- `README.md` — folder navigation guide

**Doc-shape discipline (load-bearing):** the briefing is the main read. Dim docs and comp docs are depth-on-demand — if the reader wants more on a specific dimension or competitor, they click into that doc and read it as a complete-in-itself analysis. **Each doc stands alone.** Briefing has navigation links to dim/comp docs (it's the hub). Dim docs do NOT cross-reference other dim docs, comp docs, or back to briefing. Comp docs do NOT cross-reference other comp docs, dim docs, or back to briefing. Each is self-contained for its reader. No hyperlink-hopping; the reader either reads briefing top-down OR clicks into one specific dim/comp doc and reads that end-to-end. Cross-refs between L2 docs fatigue the reader and create the impression of fragmented analysis.

**Working state during the run** (deleted before finalization):
- `_internal/` — raw per-skill outputs, pre-flight scoping notes, URL verification log, research compilations, `_state.json`, optional cross-source consistency-check notes. This folder is for YOUR orchestrator working memory during the run — context across long fan-outs, audit-trail if you want to extend the analysis with follow-up questions mid-run.

**Phase 6 final step — clean the customer-final folder:**
1. Verify all customer-visible deliverables are written and complete.
2. **Delete `_internal/` folder entirely.** The customer-final folder contains ONLY the customer deliverables (briefing + dim docs + comp docs + README). No internal-working-state artifacts ship in the deliverable.
3. Verify no customer-visible doc references `_internal/` paths — those references break after cleanup. If you wrote any during the run, remove them.

## Output structure summary

```
cmo-reports/{project-slug}-{date}/
├── README.md                   # navigation guide
├── briefing.md                 # main deliverable (includes § 9 Decision Questions)
├── dim-landscape.md            # per-dimension docs (12)
├── dim-ai-visibility.md
├── dim-agent-adoption.md
├── dim-funding-capital.md
├── ... (etc)
├── comp-{name1}.md             # per-competitor deep dives (3-5)
├── comp-{name2}.md
└── ... (etc)
```

That's the entire customer-final folder. No `_internal/`. No working-state files. Nothing the customer doesn't directly read.

**README navigation** lists the customer-visible files with one-line descriptions of what each contains. Keep it short and CMO-natural — a project title + brief intro + file list is enough. Write it the way you'd write the front page of a briefing folder for your most important customer: a clear navigation experience, no audit-checklist tone, no methodology summary, no verification meta-commentary. The customer opens this README to find their way around the folder; that's the only job it has.

**CMO report footer + README** mention data sources at the category level (e.g., "CMO report prepared from CompetLab competitive monitoring + Perplexity-grounded research across 12 dimensions, {N} competitors covered"). Skip references to working files, verification logs, or any orchestrator-internal scaffolding — those don't belong in the customer's view of their deliverable.

**Your summary-message to the user when the run completes:** lead with the strategic findings — the 3-5 sharpest discoveries the briefing surfaces (canonical convergence pattern on top vendor, structural threat newly discovered, cheapest high-leverage move, AI Viz position shift, etc.). The summary mirrors the briefing's voice: strategic, direct, customer-natural. The user's first contact with your output IS this summary; treat it as a teaser-of-the-briefing, not a recipe-completion report.

Specifically AVOID in your summary message:
- Announcing hygiene-steps you completed (don't mention deleting `_internal/`, no internal scaffolding, structure compliance — those are recipe steps, not findings)
- File counts and structural enumeration (the README covers that — let it)
- Verification methodology mentions ("URL-verified via JSON-RPC POST", "cross-source reconciled" — those stayed in your working memory)
- Internal vocabulary ("Tier-2 promoted", "FULL comp-doc", "canonical convergence paragraph", "Phase 5.x" — never in the summary)
- Self-congratulation of any shape — the customer doesn't need to hear you followed the recipe

The summary message is a CMO-direct briefing-preview, not a status report on the orchestration run.

## Calibration Rules

- **Briefing length:** 200-250 lines / 8-10k words. Tighter than data-dumps; substantive enough for CMO digestibility.
- **L2 docs:** 50-150 lines each. Self-contained mini-reports with their own thesis.
- **Naming + frame:** title the output a **CMO Report** (the default). Do NOT title it "Strategic Briefing" — that's the platform's separate persistent product this composition fetches via `get_briefing`, not what it produces.
- **Cheapest high-leverage move callout:** mandatory. Search dim docs for 1-day-fix items with disproportionate impact. Promote ONE to the briefing's sidebar.
- **convergence paragraph:** mandatory for top 1-2 strategic competitors. Multi-dimensional convergence in same-window: hiring + funding + product + ai-eco + positioning. Don't write the briefing without one.
- **Don't hedge.** Don't perform confidence either. Name what's actually there.

## Error Handling

- **Stale data on a dimension (>7d):** mark traffic-light yellow. Briefing notes prominently.
- **Sub-skill fails on a competitor (e.g., hiring-signals can't reach ATS for vendor X):** mark "data unavailable" cleanly in dim doc + comp doc. Don't block the briefing.
- **URL verification reveals fabricated Perplexity citations:** strip silently, log to `_internal/url-verification-log.md`.
- **Tier-2 candidates change between Phase 0 and Phase 1 (rare but possible if AI viz check runs mid-orchestration):** use Phase 0 list, note in briefing.

## Customer-language framing (for all customer-visible text AND your summary-message)

This applies to: briefing.md, dim docs, comp docs, README, AND the summary message you write to the user when the run completes. **Every customer-facing surface uses customer-natural language. Your internal-orchestrator vocabulary stays in your working memory.**

When you would naturally write the internal name, write the customer-visible equivalent instead — every time, no exceptions:

| Internal (use in your own decision-making) | Customer-visible (use in their deliverables) |
|---|---|
| Tier-1 (monitored set) | "currently monitored" / "monitored competitors" |
| Tier-2 unmonitored candidates | "consideration candidates" / "not currently in your monitored set" / "AI-visible-unmonitored" if descriptive context is helpful |
| Tier-3 (mention-only) | "additional brands surfaced in AI Visibility queries" |
| FULL comp-doc / LITE comp-doc / lite-comp variant | "full deep-dive" / "lighter-touch profile" |
| Phase 5.6 / Phase 5.5 / auto-promoted per criteria | the actual qualitative reasons in plain language ("verified MCP server + cross-LLM consistency + named in your Strategic Briefing + structural blind spot — warrants deep-dive coverage") |
| Convergence paragraph (≥5-dim) | the paragraph itself, with a customer-natural section heading (e.g., "[Vendor]'s coordinated 60-day repositioning") — no parenthetical mention of the pattern's template-name |
| Discovery-vs-capability carve-out | the actual finding ("vendor X has shipped an MCP server, verified live at api.vendor.com/mcp") |
| Categorical-zero / categorical-absence | "Where this signal lives in your category" |

The internal vocabulary lives in this SKILL.md + companion docs for orchestrator decision-making. None of it surfaces verbatim in customer-visible files.

## What NOT To Do

- Don't ship briefing without URL-verified MCP claims. Per `PATTERN-url-verification.md` sub-pattern: JSON-RPC POST verification, not browser GET.
- Don't generate template-driven recommendations. Use the narrative-reasoning layer (state thesis + causal story + concrete actions; not gap-template-fill).
- Don't produce data dumps — every L2 doc has a mini-thesis + strategic implication.
- Don't skip the convergence paragraph shape — that's the unique value of multi-skill orchestration.
- Don't bury the Monitoring Suggestions — they're the loop that compounds (operator adjusts monitored set → next briefing has sharper signal).

## Decision Questions

These appear in EVERY briefing output. The orchestrator extracts them from the strategic-paths section (each path's "if Y, then Z" pivot point becomes a question whose answer changes which path is recommended). Plus 1-2 questions about brand voice / risk tolerance / current customer mix that change recommendation weight.

3-5 questions max. Specific. Recommendation-altering.

## Empirical reference

This skill's output shape is described by the companion template docs at the repo root:
- `TEMPLATE-briefing.md` — L3 main briefing structure
- `TEMPLATE-dim-doc.md` — L2 dimension docs (including § 5.5 categorical-absence pattern)
- `TEMPLATE-comp-doc.md` — L2 competitor deep-dive structure

**Do not look for reference output to imitate.** The templates describe the structure; this skill describes the workflow; the KNOWLEDGE doc describes failure-mode interpretation. Together they fully specify the output. If you find yourself wanting to peek at a prior briefing to learn the shape, surface that as a skill-instruction gap in your META-REFLECTION — the relevant template/skill needs to be sharpened, not bypassed via example-lookup.
