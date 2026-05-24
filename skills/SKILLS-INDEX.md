# CompetLab AI Skills v2 — Index

> **NOT theoretical specs — grounded in real-world validation across multiple verticals.**
> Each new SKILL.md was authored against empirical friction encountered during cold-start CMO briefing builds, then iterated based on cold-instance validation runs across diverse B2B SaaS categories.

## 8 NEW SKILLS

| # | Skill | Purpose | Critical empirical learning |
|---|---|---|---|
| 1 | `competlab-status-watch` | Probe public status pages, surface recent incidents as sales ammunition | Multi-backend (Statuspage.io, Better Stack, Instatus, incident.io, Sorry, RSS, SPA) — Statuspage.io API covers ~33-64% with one adapter. **HTML content verification gate required** to catch SPA-catchall + locale-redirect false-positives. |
| 2 | `competlab-funding-watch` | 5-mode classifier (public / PE / bootstrap / VC-stage / M&A-volatile), recent rounds + ARR + exec transitions | URL Verification MANDATORY on Perplexity citations (real-world battletests found significant fabrication rates). |
| 3 | `competlab-ai-ecosystem` | EXTERNAL signals — GitHub org, npm/PyPI, community MCP servers, marketplace presence | Distinct from agent-adoption (external community vs first-party vendor signal). |
| 4 | `competlab-hiring-signals` | Multi-adapter ATS (Ashby/Greenhouse/Lever/Workable) + LinkedIn unauth + Perplexity exec moves | Pre-scan vendor-profile filter (<10-employee indie operators skip ATS); generic-word-slug name-collision verification (e.g., `folio`, `notion` slugs require ownership verification). |
| 5 | `competlab-agent-adoption` | **FIRST-PARTY MCP / Claude Skills / agent toolkit** verification | **JSON-RPC POST mandatory** — browser GET cannot prove MCP server. Real-world validation confirmed 2-of-3 false-positive rate on browser-GET verification. Categorical-zero early-exit when no MCP candidates surface (common in nascent categories). |
| 6 | `competlab-cmo-report` (ORCHESTRATOR) | Sequences existing + new skills into 1 briefing + 8-12 dim docs + 3-5 comp docs + Monitoring Suggestions | 6-phase fan-out + synthesis pattern (Phase 0 pre-flight → Phase 1 parallel-polling fan-out → Phase 2-3 L2 synthesis → Phase 4 L3 briefing → Phase 5.5 cross-tool reconciliation → Phase 5.6 Tier-2 auto-promotion → Phase 6 output). |
| 7 | `competlab-product-watch` | Snapshot changelogs / GitHub Releases / named-asset directories | SNAPSHOT only — velocity requires dimension promotion. 9th adapter: sitemap-diff for `/features/*` additions (works in categories without structured `/changelog`). |
| 8 | `competlab-customer-voice-snapshot` | G2/Capterra/Trustpilot snapshot via Perplexity | SNAPSHOT only — limited by design (review platforms 403-block scrapers). Categorical-absence early-halt after 2-3 null returns. B2B/consumer split for B2C-adjacent vendors. |

## 5 EXISTING SKILLS — Refactor Plan

| Skill | Action | Specific changes |
|---|---|---|
| `competlab-landscape` | **REFACTOR** | Trim AI section to 2-paragraph teaser → hand-off to `competlab-ai-visibility`. Trim per-competitor sections — that's now `competlab-competitor-dive` territory. Keep the macro shifts + cross-dimensional patterns + strategic recommendations. |
| `competlab-weekly-briefing` | **REFACTOR** | Narrow to STRICT delta-since-last-check. Very short output (200-400 words). Drop the dimension snapshots (those are now per-dim docs). |
| `competlab-competitor-dive` | **REFACTOR** | Drop redundant `get_competitor` step. Add references to new-skill outputs so it pulls from shared `_state.json` rather than re-deriving. Output becomes a synthesis of the per-dim+per-comp data assembled by the orchestrator. |
| `competlab-ai-visibility` | **KEEP + IMPROVE** | Add DECISION-QUESTIONS section. Add `_state.json` integration. Add output-format flexibility. |
| `competlab-battlecard` | **KEEP as-is** | Sales-specific, narrow scope. Add DECISION-QUESTIONS section. Otherwise no changes. |

## Cross-Skill Improvements (apply to ALL 13 skills)

### Decision Questions discipline
Every skill output ends with 3-5 questions whose answers materially change recommendations. NOT generic clarifications — tied to identified strategic ambiguities. Default to **conditional-prescription framing** (state both branches of recommendation pending answer) over pure-clarifying.

### Narrative recommendations (not template-driven)
Reasoning layer between raw data and recommendation output. Action-plan generation is skill-level, not platform-level. Platform exposes data; skills do reasoning.

### Shared session state (`_state.json`)
- Cached dashboard data with timestamps (avoid redundant pulls within recency window)
- Recent skill outputs in this session (downstream skills reference rather than re-derive)
- Questions already answered by operator (downstream skills don't re-ask)

### Output format flexibility
Add `--output-format` parameter: markdown / styled-html / deck-outline (4-7 slides) / notion / slack-summary (200 words) / investor-update.

## URL Verification Discipline (applies to all skills consuming Perplexity output)

Per `PATTERN-url-verification.md`:
- Every URL cited by Perplexity → probed via `mcp__competlab__fetch_url` (cleanHtml:true) BEFORE surfacing
- **For MCP-claim URLs SPECIFICALLY: JSON-RPC POST verification, NOT browser GET** (sub-pattern banked after real-world validation surfaced significant false-positive rates on browser-GET verification)
- For categorical-zero markets: skip verification entirely; record absence as first-mover-whitespace finding (the absence IS the signal)
- Fabricated URLs dropped silently; logged to `_internal/url-verification-log.md`

## Platform-Mechanics + Failure-as-Signal Discipline (mandatory orchestrator reading)

Per `KNOWLEDGE-platform-mechanics-and-failures.md`:

- **Every CompetLab dimension check is a proxy for "can an automated system extract this signal from your site."** Failed scan ≠ "no data." Failed scan = "this data is invisible to automation."
- **Cascade-aware:** sitemap broken → pricing skipped → content gaps; positioning locale-redirected → wrong-language headline captured → false action-plan recommendations.
- **Decision logic when ANY scan returns null for customer's own site:** cross-check with sibling dimensions. If sibling confirms data exists → parseability gap (NOT no-data gap). Surface as "invisible to automation, material AI Viz consequence" strategic finding.
- **Cross-source consistency:** the orchestrator silently picks the more credible signal when sources disagree (deeper probe-depth wins) — customer-visible deliverables carry the conclusion, not the cross-check process.

Example shape: pricing in iframe → pricing dim returns null while positioning dim confirms pricing exists. Customer-facing recommendation: "your pricing is invisible to AI training crawlers → comparison-pricing queries can't extract your prices → ceding pricing-leadership-narrative to competitors." 1-day fix: static HTML pricing table alongside iframe widget.

## Repo layout

```
competlab-ci-skills/
├── README.md, AGENTS.md, CONTRIBUTING.md, LICENSE  (top-level docs)
└── skills/
    ├── SKILLS-INDEX.md                              (this file)
    ├── PATTERN-url-verification.md                  URL Verification discipline + MCP JSON-RPC POST sub-pattern + discovery-vs-capability carve-out
    ├── KNOWLEDGE-platform-mechanics-and-failures.md per-dimension mechanics + failure modes + cross-dim cascade + decision logic + vendor-discontinuation pattern
    ├── TEMPLATE-briefing.md                         L3 main briefing structure
    ├── TEMPLATE-dim-doc.md                          L2 dimension docs structure (incl. categorical-absence pattern)
    ├── TEMPLATE-comp-doc.md                         L2 competitor deep-dive structure (incl. lite-comp variant)
    ├── competlab-agent-adoption/SKILL.md            (NEW)
    ├── competlab-ai-ecosystem/SKILL.md              (NEW)
    ├── competlab-ai-visibility/                     (existing — KEEP + improve)
    ├── competlab-battlecard/                        (existing — KEEP as-is)
    ├── competlab-cmo-report/SKILL.md                (NEW — orchestrator)
    ├── competlab-competitor-dive/                   (existing — REFACTOR)
    ├── competlab-customer-voice-snapshot/SKILL.md   (NEW)
    ├── competlab-funding-watch/SKILL.md             (NEW)
    ├── competlab-hiring-signals/SKILL.md            (NEW)
    ├── competlab-landscape/                         (existing — REFACTOR)
    ├── competlab-product-watch/SKILL.md             (NEW)
    ├── competlab-status-watch/SKILL.md              (NEW)
    └── competlab-weekly-briefing/                   (existing — REFACTOR)
```

13 skills + 6 companion docs, all under `skills/`. Companion docs live alongside skill folders so a single `cp -r skills/. .claude/skills/` install grabs everything in one command.

The orchestrator (`competlab-cmo-report`) reads all 6 companion docs at Phase 0; sub-skills consuming Perplexity output reference `PATTERN-url-verification.md` for URL Verification discipline.

## Install paths

**Path 1 — Manual `cp -r` (simplest, project-level):**
```bash
mkdir -p .claude/skills
cp -r path/to/competlab-ci-skills/skills/. .claude/skills/
```
After this, `.claude/skills/` contains the 13 skill folders + 6 companion docs at root. Orchestrator's Phase 0 `{skills_root}` resolves to `.claude/skills/` and finds companion docs cleanly.

**Path 2 — Claude Code plugin marketplace** (after `marketplace.json` is updated to declare all 13 skills + companion docs):
```bash
npx skills add ORI-Solutions/competlab-ci-skills --all
```

**Path 3 — User-level** (available across all projects):
```bash
cp -r path/to/competlab-ci-skills/skills/. ~/.claude/skills/
```
