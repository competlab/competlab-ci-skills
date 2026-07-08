# Changelog

All notable changes to the CompetLab AI Skills suite.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-05-24

The "leading + lagging indicators" release. Skills set expands from 5 to 13. The original 5 skills cover **lagging indicators** (what's already visible in monitoring data); the 8 new skills add **leading indicators** (what competitors are about to do — funding rounds before press cycles, hiring patterns before product launches, MCP servers before category-wide agent adoption). A new orchestrator (`competlab-cmo-report`) sequences all 13 into a single one-command CMO-grade strategic briefing.

### Added — 8 new skills

- **`competlab-cmo-report`** (orchestrator) — produces complete CMO-grade strategic briefing in one command: 1 main briefing (L3, 200-250 lines / 8-10k words) + 12 per-dimension docs (L2) + 3-5 per-Tier-1-competitor deep dives + Monitoring Suggestions informed by Tier-2 light-recon. Six-phase workflow: pre-flight → parallel skill fan-out → per-dim synthesis → per-competitor synthesis → briefing synthesis → cross-tool reconciliation + Tier-2 auto-promotion → final QC.
- **`competlab-status-watch`** — probes public status pages (Statuspage.io API + Better Stack + Instatus + incident.io + SPA/RSS adapters) for outages, recent incidents, post-mortem quality, and status-page-broken-or-missing as customer-facing signal. HTML content verification gate prevents SPA-catchall + locale-redirect false positives.
- **`competlab-funding-watch`** — 5-mode classifier (Public, PE-owned, Bootstrap, VC-stage, M&A-volatile). Recent rounds + ARR estimates + exec transitions + category-adjacent capital pressure. URL-Verified Perplexity citations only.
- **`competlab-ai-ecosystem`** — external developer-ecosystem signals (GitHub orgs, npm/PyPI volumes, community-built MCP servers, marketplace presence). Distinct from agent-adoption (which measures first-party signals).
- **`competlab-hiring-signals`** — multi-adapter ATS probes (Ashby/Greenhouse/Lever/Workable) + LinkedIn unauth fallback + Perplexity for exec transitions. Vendor-profile pre-scan (<10-employee bootstrap operators skip ATS) + generic-word-slug name-collision verification.
- **`competlab-agent-adoption`** — **JSON-RPC POST verification** of MCP server claims (browser GET 200 ≠ MCP exists). Wraps CompetLab's 25-check Agent-Adoption Specification scan. Validated against real-world false-positive patterns (2 of 3 browser-GET-200 verifications were not real MCP servers; the JSON-RPC POST gate caught them).
- **`competlab-product-watch`** — snapshots competitor changelogs / GitHub Releases / named-asset directories / MCP marketplaces / API doc versions. 9-adapter cascade including sitemap-diff for `/features/*` additions when no structured `/changelog`.
- **`competlab-customer-voice-snapshot`** — G2/Capterra/Trustpilot snapshots via Perplexity + Reddit/HN recovery for developer-tool categories. Categorical-absence early-halt for categories where reviews don't live on B2B SaaS platforms.

### Added — 6 companion docs (under `skills/` root)

- **`PATTERN-url-verification.md`** — URL Verification discipline + MCP-server JSON-RPC POST sub-pattern + categorical-zero discovery-vs-capability carve-out.
- **`KNOWLEDGE-platform-mechanics-and-failures.md`** — per-dimension mechanics + failure modes + cross-dim cascade map + decision logic + vendor-discontinuation 3-signal convergence rule + scan-failure-as-customer-facing-signal framing.
- **`TEMPLATE-briefing.md`** — L3 main briefing structure with cross-dim convergence-paragraph pattern + Operator Questions conditional-prescription framing + cheapest-high-leverage callout + Monitoring Suggestions section.
- **`TEMPLATE-dim-doc.md`** — L2 dimension docs structure (incl. categorical-absence-as-first-class-finding § 5.5).
- **`TEMPLATE-comp-doc.md`** — L2 competitor deep-dive structure (incl. lite-comp variant for Tier-2 borderline 2/4-criterion candidates).
- **`SKILLS-INDEX.md`** — full skill index + install paths + cross-skill improvements.

### Added — core architectural concepts

- **Tier system for competitor coverage:** Tier-1 (all monitored, full deep-dive) + Tier-2 (top-3 AI-visible-unmonitored, lite-recon → auto-promotion per 4-criterion checklist) + Tier-3 (mention-only, table-row in `dim-ai-visibility.md`).
- **Two-axis L2 backing docs:** Axis A = per-dimension reports (12 horizontal slices); Axis B = per-competitor deep-dives (3-5 vertical slices, including Tier-2 auto-promotions).
- **L3 briefing as synthesis layer:** 200-250 lines target. Cross-references L2 evidence. Includes convergence paragraph for any competitor with ≥5-dim convergence within ≤60-day window, 3-strategic-paths-with-combo-recommendation, cheapest-high-leverage-move callout, Monitoring Suggestions, 3-5 Operator Questions with conditional-prescription framing.
- **Failed scan = strategic signal:** the orchestrator and KNOWLEDGE doc treat scan failures as customer-discoverability evidence rather than methodology noise. ("Your pricing is in an iframe → invisible to AI training crawlers → AI Viz consequence — 1-day fix: static HTML pricing table.")
- **Categorical-zero discovery-vs-capability carve-out:** when well-known-path discovery returns zero candidates across all vendors, check alternative channels (content dashboard URLs, npm registry, GitHub search, API endpoint patterns) BEFORE declaring categorical zero. Empirical basis: a real-world validation run found a vendor's real MCP server at an API endpoint without `/.well-known/mcp` mount, which the strict early-exit would have missed.
- **Vendor-discontinuation 3-signal convergence rule:** positioning dashboard captures parent-brand content + AI Viz 0% across all 3 providers + agent-adoption scan `finalUrl` ≠ requested domain → likely discontinued/absorbed. Verify via parent-company page fetch for shutdown language. (Surfaced when a real-world cold-instance run discovered one monitored competitor had been discontinued 12 months prior.)
- **Cross-tool reconciliation discipline (Phase 5.5):** when two CompetLab tools disagree on the same underlying surface, the orchestrator writes a canonical `Phase-5.5-reconciliation.md` audit-trail file with one section per disagreement. Dim docs and briefing reference this file by section anchor rather than restating analysis.
- **Tier-2 auto-promotion 4-criterion checklist (Phase 5.6):** AI Viz mention rate ≥ median(surfaced brands) OR ≥ 50% (whichever lower) + cross-provider consistency (≥2 of 3 LLM providers) + Agent Adoption OR trust-signal threshold + strategic signal type (blind-spot OR category-redefining).

### Changed

- **Tool namespace unified across all 13 skills:** `mcp__claude_ai_CompetlabMCP__*` → `mcp__competlab__*`. Required for the orchestrator to call existing sub-skills cleanly.
- **README updated** to reflect 13 skills + companion docs + new install-path documentation.
- **All 5 existing skills are also bumped to 2.0.0** (no breaking changes, but renumber tracks them as part of the orchestrator-compatible set).
- **`.claude-plugin/marketplace.json`** updated to declare all 13 skills (was: 5).

### Repository structure

Companion docs moved to `skills/` root (alongside the 13 skill folders), so single-command install grabs everything:
```bash
cp -r competlab-ci-skills/skills/. .claude/skills/
```

### Empirical validation

Skills v2 was validated through 3 cold-instance runs (real Claude Code instance, separate terminal, orchestrator executing end-to-end) across 3 different B2B SaaS verticals:
- **B2B Customer Success SaaS** (Customerscore.io with 5 monitored + 2 Tier-2 promoted)
- **Hospitality / vacation rental** (Touch Stay with 6 monitored)
- **Personalization / geo-targeting** (Geo Targetly with 5 monitored + 2 Tier-2 promoted)

Each run produced a META-REFLECTION audit (5+ questions answered with depth) that drove 24 total skill iterations during the iteration cycle. Pre-publish, 3 parallel review subagents (Critic + Skills Architect + CMO Reader) audited the iterated skill set; their findings drove a final fixes round including the namespace unification (S1 ship-blocker) and the discovery-vs-capability carve-out propagation (C1 cross-doc consistency bug).

The Customerscore.io cold-instance backwards-validation run with published skills produced a briefing that a CMO-reader subagent judged "forward-able to leadership team — not 'after revisions'" against a manual senior-analyst comparison baseline. Notable finding: the cold instance discovered that one monitored competitor (Churn360) had been discontinued by parent company 12 months prior — a fact the manual baseline missed. This validates the vendor-discontinuation detection pattern as the canonical "what this skill set produces that manual senior-analyst work would not necessarily catch."

---

## [1.0.0] — 2025

Initial 5-skill release covering lagging indicators:
- `competlab-ai-visibility` — AI model mention and recommendation reports
- `competlab-weekly-briefing` — on-demand CI briefing you can run any time (many teams run it weekly)
- `competlab-competitor-dive` — full competitor dossier with SWOT
- `competlab-battlecard` — sales-ready battlecards
- `competlab-landscape` — full landscape with market dynamics
