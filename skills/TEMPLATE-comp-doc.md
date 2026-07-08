# TEMPLATE — L2 Competitor Deep Dive (vertical slice, one per Tier-1 competitor)

**Filename convention:** `comp-{slug}.md` (one per Tier-1 competitor).
**Target length:** 80-180 lines. The richest backing doc — single competitor across all dimensions.
**Audience:** CMO who clicked "By Competitor → [this comp]" from briefing nav. Or sales rep prepping a competitive deal. Or strategist watching a specific rival.
**Coverage tier:** Tier-1 only (all currently-monitored + auto-promoted top-N AI-visible-unmonitored if strategic relevance justifies). See `competlab-cmo-report.SKILL.md` § Phase 5.6 for the Tier-2 auto-promotion rule.

This is the doc shape where the **convergence-paragraph pattern** lives in full — multi-dimensional convergence on a single rival's trajectory.

---

## Required structure

### Header block

```
# [Competitor Name] — Deep Dive
> Generated {date} | Coverage: [X] of [Y] dimensions yielded data
> Source skills: [list, e.g., `landscape`, `ai-visibility`, `funding-watch`, `hiring-signals`, `ai-ecosystem`, `agent-adoption`, `status-watch`, `product-watch`, `customer-voice-snapshot`]
```

The "X of Y dimensions yielded data" line signals graceful degradation. If hiring-signals couldn't reach this competitor (no ATS, name-collision pollution), it shows here honestly.

### Section 1 — Mini-thesis (1 paragraph)

The single most important strategic statement about THIS competitor's trajectory. Examples:

- *"[Competitor] is executing a coordinated upmarket pivot across 5 dimensions in the same 30-day window: [evidence]. Strategically: [competitor] competes less directly with [user's brand] in 2026 H2, but creates more SEO + AI-agent-ecosystem pressure."*
- *"[Competitor]'s public-record evidence shows [classification]: [funding posture] + [product velocity] + [hiring pattern] + [AI Visibility Score trend]. The competitive relationship to [user's brand] is [direct / adjacent / divergent]."*

This thesis is what the CMO remembers about this competitor after reading.

### Section 2 — Quick profile (table)

```
| Field | Value |
|---|---|
| Domain | [domain] |
| Founded | [year if known] |
| Funding posture | [public / PE / bootstrap / VC-stage / M&A-volatile] |
| ARR estimate | [if known, with source] |
| Team size | [if known] |
| AI Visibility Score | [in user's category] |
| Tagline | [from homepage] |
| Status page | [URL / not present / broken] |
```

Skip fields where data isn't available rather than padding with "Unknown".

### Section 3 — Per-dimension data sections

One subsection per dimension that yielded data. Each subsection:

- **Pricing & Packaging** (if data available)
- **Positioning & Messaging**
- **AI Visibility** (mention rate and score + per-provider breakdown + trend)
- **Funding & Capital**
- **Hiring & GTM** (with disambiguation if name-collision pollution applies)
- **Product & Releases** (changelog signals, recent shipment)
- **AI Ecosystem** (GitHub org, npm downloads, MCP server, marketplace presence)
- **Agent Adoption** (first-party MCP + Skills directory + agent-toolkit)
- **Reliability & Status** (status page state + recent incidents)
- **Customer Voice** (review snapshots + recent complaint themes)
- **Tech & Trust** (security headers, compliance, tech stack)
- **Content Strategy** (content volume, types, comparison-page presence)

Each subsection is 2-4 sentences narrative + bullet list of concrete signals with dates. Cite the source skill name in a footer line: *"Source: `competlab-{skill}` {YYYY-MM-DD}"*.

### Section 4 — Cross-dimensional pattern callouts (the convergence-paragraph zone)

The unique value of this doc. Patterns ONLY visible because all dimensions are looked at side-by-side for THIS competitor.

Example: *"Same 30-day window: rebranded to '[X]' + content velocity push ([N] URLs in one week) + secondary CTA shift to '[Y]' + lost [certification] + launched '[product]' ([date]) + published [N]-skill Claude Skills directory + [M] open US jobs including '[role 1]' and '[role 2]'. Capital story underneath: [posture] + acquired [target] for [$X] cash. Five-dimension synthesis: [interpretation]."*

This is the canonical multi-skill convergence. 1-2 such paragraphs per comp doc, where the evidence supports them.

**convergence paragraph eligibility is data-density-driven, not Tier-driven** (banked from real-world validation). A Tier-2 promoted comp doc with ≥5 dimensions of substantive data CAN and SHOULD include a convergence paragraph if the cross-dim pattern is genuinely there. The on-demand scans + Perplexity-grounded research available for Tier-2 candidates often produce sufficient cross-dim density (especially for vendors with active funding events, named recent product launches, OR distinct positioning shifts). For **lite-comp-doc** Tier-2 entries (per orchestrator Phase 5.6 intermediate-tier rule), skip the convergence paragraph entirely — lite-comp docs are 30-50 lines on 2-3 most strategically loaded dimensions, no full cross-dim synthesis needed.

### Section 5 — Trajectory direction

Where this competitor is going, based on the cross-dim patterns. 1-2 paragraphs. NOT speculation — directional reads grounded in the evidence above.

End with one explicit signal-to-watch: *"If [X] happens in next [N] checks, the trajectory accelerates / reverses / confirms."*

### Section 6 — What this competitor's trajectory means for [brand]

The strategic implication. 2-3 paragraphs.

- Direct competitive impact (where they win/lose against the user's brand)
- Indirect pressure (SEO, AI-narrative, agent-ecosystem, talent market)
- Recommended response (concrete, prioritized)

End with 1-2 sentences feeding back into the briefing's strategic-path framing: "This competitor's trajectory supports [Path A / B / C] for [user's brand] because..."

### Section 7 — Data freshness + gaps

Short paragraph: what's fresh, what's partial. **When data on a sub-skill is partial for this competitor, lead with what that partiality means for them — not what your monitoring pipeline experienced.**

For example: if their homepage is bot-protected, the customer-facing frame is the finding ABOUT THE VENDOR — *"their site is invisible to AI training crawlers + comparison-engine bots → material AI Visibility consequence for them; opportunity for your customer to surface where they're differently positioned."* That's a real strategic insight about the vendor's discoverability posture.

If a sub-skill yielded nothing for this vendor for any reason, the simplest framing is *"signal unavailable for {vendor} in this run"* — then either extract the implication (their discoverability posture is the finding) or simply note the coverage gap and move on to the dimensions that DID yield data. Customers care about insights about the vendor, not about your data-collection pipeline.

---

## LITE-COMP VARIANT (for Tier-2 borderline 2/4-criterion candidates with strong qualitative case)

When you're producing a lighter-touch comp doc for a candidate that warrants coverage but doesn't justify a full deep-dive (e.g., an adjacent-segment vendor whose AI Visibility surface is large but who isn't a direct procurement competitor), use this shortened variant instead of the full structure above:

**Target length:** 30-50 lines (vs 80-180 for full)
**Header tag (customer-facing language):** `> Not currently in your monitored set; included here for cheap-recon depth — lower-priority candidate to consider adding to monitoring.`

Sections to KEEP:
- Header block (shorter — list only the 2-3 source skills that produced data)
- Section 1 — Mini-thesis (1 paragraph, focused on the qualitative case for monitoring this vendor)
- Section 2 — Quick profile (table; same shape, smaller fields list)
- **Selective per-dimension sections** — ONLY the 2-3 most strategically loaded dimensions (e.g., for a category-redefining-by-free-tier vendor: AI Viz + Positioning + Pricing). NOT all 11.
- Section 6 — What this competitor's trajectory means for [brand] (2 paragraphs)
- Section 7 — Data freshness + gaps (1 line)

Sections to OMIT:
- Section 4 (convergence paragraph cross-dimensional callouts) — by definition, lite-comp candidates don't have enough cross-dim convergence to justify a convergence paragraph
- Section 5 (trajectory direction with explicit signal-to-watch) — optional; include only if a discrete watch-signal exists
- The remaining 8-9 per-dimension sections

**Mini-thesis shape for lite-comp:** name the qualitative case explicitly. Example: *"[Vendor] surfaces with a leading OpenAI AI Visibility Score for category-redefining-by-free-tier positioning. Single-provider AI Viz signal (not cross-provider), so doesn't earn full deep-dive — but the Strategic Briefing calls it out by name as a category-redefining threat to customer's paid-tier model, and it outperforms Tier-1 monitored on Agent Adoption. Worth a 30-50 line summary so the operator can decide whether to elevate to Tier-1 monitoring in the next planning cycle."*

---

## What to AVOID

- Don't over-pad small competitors — if a vendor has 3 dimensions of meaningful data and 7 of "not detected", the comp doc is shorter and that's fine
- Don't include cross-brand domain footnotes that are technically NULL (per the known cross-brand-footer pitfall pattern) without flagging them
- Don't include unverified Perplexity citations — `PATTERN-url-verification.md` Steps 1-4 must clear
- Don't restate the dimension docs' cross-competitor synthesis — that lives in L2 dim docs
- Don't speculate about private metrics (revenue, burn) unless publicly reported
- Don't use "ammunition" / "asset" / "deploy" / "intel" / "deliverable" — clinical-AI-speak. Plain English: "talking point" / "competitive evidence" / "release" / "research" / "output."
