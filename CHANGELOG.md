# Changelog

All notable changes to the CompetLab Agent Skills suite.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.2] — 2026-09-25

### Changed

- The briefing skill and the shared platform notes follow Strategic Tickets phase 3.2: from the
  second edition on, the briefing reads the board before it writes. The briefing's `tickets` field
  now says what the edition did to the board in one call — `opened`, `commented`, `alreadyOnBoard`,
  `recheckedUnchanged` — and a thread entry with `briefing` set is the edition's comment, with a
  `kind` (`result` — Measured after close; `basis_weaker` / `basis_stronger` / `basis_changed` /
  `basis_gone` — Reason weaker / stronger / changed / gone).
- The rule that goes with it: **an edition's comment is a measurement, not a verdict.** Report it as
  it states it — two dated facts joined by "then" — never as the fix having worked, never as a
  percentage or a trend, and say *not checked* (never *unchanged*) for a ticket the edition did not
  measure.
- `check:facts` gains two rules: a result stated with an arrow between two counts or dates, and
  "Google AI Overviews recommended" (it names companies in prose and ranks nothing — it *names*). <!-- facts-ok -->

## [3.2.1] — 2026-09-24

### Fixed

- The AI Visibility skill now says where the verdict word comes from: the customer row's `zone` —
  `named_in_a_quarter_or_more_of_answers` is Core, `share_not_yet_separable` is Too early to tell,
  `named_in_under_a_tenth_of_answers` is Rarely recommended.
- The briefing skill's status table said a run "takes about two hours"; it finishes within two hours.

---

## [3.2.0] — 2026-09-24

### Fixed

- **The briefing skill asked for a section that no longer exists.** "What to do about it" and the
  full landscape requested `sections: ["hub","actions"]`. The platform removed `actions` on
  2026-09-19, and asking for it is now refused with a 400. Every recommendation in a briefing now
  opens as a ticket on the project's Strategic Tickets board, most important first. The skill reads
  the hub's top moves and then the edition's tickets with `list_tickets` (`origin: "briefing"`,
  `briefingRunId`). It reports where each ticket stands and never re-proposes work the team has
  already closed or dismissed. `list_tickets` is added to its `allowed-tools`.
- The platform reference no longer lists an `actions` section, and a briefing run is described as
  finishing within two hours rather than taking "about two hours".

### Changed

- **The AI Visibility verdict uses the product's own three words:** Core, Too early to tell, and
  Rarely recommended, each with the meaning the app shows. "Core or tail" is gone from the skill's
  title, its output heading and its decision question, and from the shared reading rules.
- `check-allowed-tools` knows the ten Strategic Tickets tools.

---

## [3.1.1] — 2026-09-24

### Fixed

- **The old word in prose, where the dimension is Agent Adoption.** The briefing skill's list of the
  eight researched areas, the README's suggested site-audit prompt and one of the site audit's trigger
  phrases used it. All three now say agent adoption; the site audit triggers on "is our site set up for
  AI agents" instead. The keys `agent-readiness` and `deep-agent-readiness` are frozen identifiers and
  are unchanged.

### Changed

- **A stale-fact rule for the word.** `check-facts` now refuses it in prose. The two frozen keys and the
  trust-signal category `enterprise readiness` pass. Proved with a negative test: the spaced and the
  capitalised hyphenated forms fail, and every identifier form passes.
- The stale tool-count rule no longer states a count of its own; it points at the served server card.

---

## [3.1.0] — 2026-09-12

### Fixed

- **The AI Sources work list came back empty.** The skill filtered core hosts on `ownership: "publisher"`
  and `"community"`. `ownership` has exactly two values — `third_party` and `competitor_owned` — so the
  filter matched nothing and produced a clean empty result rather than an error. `publisher` and
  `community` are values of a different field, `kind`, which describes the sort of site and is not a
  filter. The work list is now `third_party`, and the skill quotes `funnel.missingPublishers` /
  `missingCompetitorOwned`, which the platform precomputes.
- **Monitoring setup read a field that does not exist.** It looked for `origin` on market-map brand rows
  to find untracked brands. There is no such field. It now reads `untrackedCoreBrands`, which the
  platform computes directly, with each brand presence and range.
- The `brand=` token estimate was for a three-engine check. It is roughly 2k there and about 9k once
  Google AI Overviews is in the ask.
- A reference inside a skill pointed at `references/reading-the-data.md` from within `references/`.

### Added

- Reading rules the skills were missing: `headerInspection: { available: false }` is a note about the
  fetch and never a caveat on the numbers; `check_sitemap` `status: partial` is never the site total,
  and `unreadSitemaps` is the site own defect.

### Changed

- **Three CI holes closed, each proved with a negative test.** A reference inside a skill now resolves
  against that skill only, so a skill shipped without the doc its body reads fails the check. Case
  checking walks every path segment, not just the filename. Three fact rules added — buying-question
  count, briefing analysis-area count, and a looser engine-count rule, which immediately caught a live
  stale claim.
- Remaining detail about live validation runs removed from the historical entries.

## [3.0.2] — 2026-09-12

### Changed

- Third-party vendor names removed from the historical v2 entries. The entries still record what each
  retired skill did; they no longer name the specific status-page backends, applicant-tracking systems
  or review platforms it probed.

## [3.0.1] — 2026-09-12

### Fixed

- The two shared reference docs cross-referenced each other by their `shared/` names while shipping
  into each skill's `references/` under lowercase names. Those links resolved only on a
  case-insensitive filesystem, so every installed copy pointed at a missing file on Linux and on a
  case-sensitive macOS volume. `sync-shared` now rewrites the cross-references, and the reference
  check resolves case-sensitively on every platform so this cannot pass locally again.

## [3.0.0] — 2026-09-12

**The platform grew into the work these skills were doing by hand, so the skills now read it instead.**

When v2 shipped in May, CompetLab monitored five dimensions and the interesting signals about a <!-- facts-ok: describing the product as it was in May 2026 -->
competitor — funding, hiring, launches, reliability, reviews, developer ecosystem — lived outside the
platform. Eight skills went and fetched them. That was the right shape for the product as it stood.

CompetLab now researches all of it natively. The Strategic Briefing covers **14 analysis areas** — the
six monitored dimensions plus eight it researches for the briefing alone — in numbered editions that
persist, with prior readings to difference against and its own limits stated. It probes more sources
than a skill can in a session, and it remembers.

So the suite changes job. It no longer does the research. It reads the platform correctly and shapes
what the platform found into the thing someone actually needs. That is seven skills instead of
thirteen, and a much smaller surface to keep true.

### Breaking

- **Seven skills removed.** `competlab-status-watch`, `competlab-funding-watch`,
  `competlab-hiring-signals`, `competlab-agent-adoption`, `competlab-ai-ecosystem`,
  `competlab-product-watch`, `competlab-customer-voice-snapshot`. Each is now a section of the
  Strategic Briefing: `deep-reliability-status`, `deep-funding-capital`, `deep-hiring-gtm`,
  `deep-agent-readiness`, `deep-ai-ecosystem`, `deep-product-launches`, `deep-customer-voice`. Ask
  `competlab-briefing` for them.
- **`competlab-cmo-report`, `competlab-weekly-briefing` and `competlab-landscape` replaced by
  `competlab-briefing`**, which reads the platform's briefing at whatever depth the question needs —
  a short pulse, a full landscape, or one dimension in depth. The orchestrator's six-phase fan-out
  composed by hand what the platform now composes server-side.
- **Shared companion docs restructured.** The six documents at `skills/` root are now two —
  `READING-THE-DATA.md` and `PLATFORM.md` — carried inside each skill's `references/`, so every
  install path gets them. The previous layout only worked for a manual `cp -r`.

### Added

- **`competlab-ai-sources`** — the sixth dimension, which had no skill. Which pages Perplexity and
  Google AI Overviews retrieved while answering the category's buying questions, which companies those
  answers named, and the work list of approachable hosts that name competitors and not you. Ships with
  the two limits that travel with every claim: training data often outweighs what the models read, and
  a source can be read by every engine and belong to a company none of them recommend.
- **`competlab-site-audit`** — runs on any public domain with no project and no competitors configured;
  a free-trial key is all it needs. Crawler
  access, sitemap, agent adoption, tech stack, trust signals. In project mode it audits your own site
  and separates "we could not read this" from "this is not there". Carries the JSON-RPC verification
  that proves whether a claimed MCP server actually answers, which a browser GET cannot.
- **`competlab-monitoring-setup`** — whether you are monitoring the right competitors, asking the right
  questions, and running at the right cadence. Reads the briefing's own promotion suggestions rather
  than re-deriving them.
- **`READING-THE-DATA.md`** — the reporting discipline the platform enforces on itself, written down:
  `null` means not measured and never zero; counts never rates; per engine never pooled; retrieved
  never cited; ranges that overlap are not ordered. This is the part of the suite that matters most.
- **CI.** The repo now checks that every skill's `allowed-tools` covers the tools its body invokes,
  that every referenced file exists, and that a set of facts about the product has not gone stale.

### Changed

- **`competlab-ai-visibility` leads with membership, not a score.** The dimension answers one question:
  which companies do the AI models recommend in this category, and are you one of them. Core, tail, or
  neither. Presence, ranges and per-engine splits are the mechanism that decides membership, not the
  answer — and the blended score is no longer what the skill opens with.
- **AI Visibility covers five engines**: ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews.
  Google AI Overviews names companies in prose and ranks nothing — any order shown is CompetLab's order
  of first mention, never a position Google assigned.
- **Six dimensions** throughout: AI Visibility, AI Sources, Positioning, Pricing Intelligence, Content
  Intelligence, Tech & Trust Profile.
- **`get_ai_visibility_trend` is read as a digest, not a time series.** It returns a reading now, a
  reading at the window's start, and whether the two are separable. Where the intervals overlap, that
  is two readings rather than a movement, and the skills now say so.
- **`competlab-competitor-dive` and `competlab-battlecard`** read all six dimensions and the briefing's
  per-rival sections instead of re-researching them, and every figure carries the count it came from.
- The MCP endpoint is stated correctly as `https://mcp.competlab.com/mcp` (Streamable HTTP, `CL-API-Key`
  header). `competlab.com/developers/mcp` is the setup documentation page.

### Removed

- Statistics the suite could not source, and provenance tags that carried no instruction.
- Hardcoded vendor names used as examples, which age badly in a public repo.

## [2.0.1] — 2026-07-08

Maintenance release: aligns the repo with the shipped product, fixes a broken tool reference, and adopts the "Agent Skills" name. No new skills and no breaking changes — every slug is unchanged.

### Fixed

- `get_action_plan` → `get_briefing` in `competlab-weekly-briefing`, `competlab-landscape`, and `competlab-cmo-report`. `get_action_plan` is not a CompetLab MCP tool, so those skills' briefing step would have failed.
- Corrected an install command that referenced the wrong GitHub org.

### Changed

- Renamed the suite to **CompetLab Agent Skills** (from "CompetLab AI Skills"). Display name only — the plugin, package, and install id `competlab-ci-skills` are unchanged.
- Clarified **CMO report vs. Strategic Briefing**: the `competlab-cmo-report` orchestrator composes a live *CMO report* from the skills; the *Strategic Briefing* is the platform's persistent monthly product the skills fetch via `get_briefing` rather than produce.
- Consistent terminology across the suite — "AI Visibility Score" (not "rank"), "Agent Adoption" (not "agent-readiness") — and corrected tool/method counts (33 MCP tools, 34 SDK methods). <!-- facts-ok: historical entry -->
- Reframed `competlab-weekly-briefing` as an on-demand briefing you run whenever you want, rather than implying a fixed weekly cadence.

### Removed

- Index entries for `_state.json` shared session state and a `--output-format` flag, which no skill implements.

## [2.0.0] — 2026-05-24

The "leading + lagging indicators" release. Skills set expands from 5 to 13. The original 5 skills cover **lagging indicators** (what's already visible in monitoring data); the 8 new skills add **leading indicators** (what competitors are about to do — funding rounds before press cycles, hiring patterns before product launches, MCP servers before category-wide agent adoption). A new orchestrator (`competlab-cmo-report`) sequences all 13 into a single one-command CMO-grade strategic briefing.

### Added — 8 new skills

- **`competlab-cmo-report`** (orchestrator) — produces complete CMO-grade strategic briefing in one command: 1 main briefing (L3, 200-250 lines / 8-10k words) + 12 per-dimension docs (L2) + 3-5 per-Tier-1-competitor deep dives + Monitoring Suggestions informed by Tier-2 light-recon. Six-phase workflow: pre-flight → parallel skill fan-out → per-dim synthesis → per-competitor synthesis → briefing synthesis → cross-tool reconciliation + Tier-2 auto-promotion → final QC.
- **`competlab-status-watch`** — probes public status pages through adapters for the common hosted status-page backends, plus SPA and RSS, for outages, recent incidents, post-mortem quality, and status-page-broken-or-missing as customer-facing signal. HTML content verification gate prevents SPA-catchall + locale-redirect false positives.
- **`competlab-funding-watch`** — 5-mode classifier (Public, PE-owned, Bootstrap, VC-stage, M&A-volatile). Recent rounds + ARR estimates + exec transitions + category-adjacent capital pressure. URL-Verified Perplexity citations only.
- **`competlab-ai-ecosystem`** — external developer-ecosystem signals (GitHub orgs, npm/PyPI volumes, community-built MCP servers, marketplace presence). Distinct from agent-adoption (which measures first-party signals).
- **`competlab-hiring-signals`** — multi-adapter probes across the common public applicant-tracking systems, an unauthenticated professional-network fallback, and Perplexity for exec transitions. Vendor-profile pre-scan (<10-employee bootstrap operators skip ATS) + generic-word-slug name-collision verification.
- **`competlab-agent-adoption`** — **JSON-RPC POST verification** of MCP server claims (browser GET 200 ≠ MCP exists). Wraps CompetLab's 25-check Agent-Adoption Specification scan. Added because a browser GET returning 200 does not establish that an MCP server exists, and verification that relied on it produced false positives.
- **`competlab-product-watch`** — snapshots competitor changelogs / GitHub Releases / named-asset directories / MCP marketplaces / API doc versions. 9-adapter cascade including sitemap-diff for `/features/*` additions when no structured `/changelog`.
- **`competlab-customer-voice-snapshot`** — review-platform snapshots via Perplexity, with community-forum recovery for developer-tool categories. Categorical-absence early-halt for categories where reviews don't live on B2B SaaS platforms.

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
- **Categorical-zero discovery-vs-capability carve-out:** when well-known-path discovery returns zero candidates across all vendors, check alternative channels (content dashboard URLs, npm registry, GitHub search, API endpoint patterns) BEFORE declaring categorical zero. A real MCP server can sit at an API endpoint with no `/.well-known/mcp` mount, which a strict early exit would miss.
- **Vendor-discontinuation 3-signal convergence rule:** positioning dashboard captures parent-brand content + AI Viz 0% across all 3 providers + agent-adoption scan `finalUrl` ≠ requested domain → likely discontinued/absorbed. Verify via parent-company page fetch for shutdown language. <!-- facts-ok: historical entry, describing the three-engine era -->
- **Cross-tool reconciliation discipline (Phase 5.5):** when two CompetLab tools disagree on the same underlying surface, the orchestrator writes a canonical `Phase-5.5-reconciliation.md` audit-trail file with one section per disagreement. Dim docs and briefing reference this file by section anchor rather than restating analysis.
- **Tier-2 auto-promotion 4-criterion checklist (Phase 5.6):** AI Viz mention rate ≥ median(surfaced brands) OR ≥ 50% (whichever lower) + cross-provider consistency (≥2 of 3 LLM providers) + Agent Adoption OR trust-signal threshold + strategic signal type (blind-spot OR category-redefining). <!-- facts-ok: historical entry -->

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

---

## [1.0.0] — 2025

Initial 5-skill release covering lagging indicators:
- `competlab-ai-visibility` — AI model mention and recommendation reports
- `competlab-weekly-briefing` — on-demand CI briefing you can run any time (many teams run it weekly)
- `competlab-competitor-dive` — full competitor dossier with SWOT
- `competlab-battlecard` — sales-ready battlecards
- `competlab-landscape` — full landscape with market dynamics
