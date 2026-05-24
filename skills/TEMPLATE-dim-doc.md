# TEMPLATE — L2 Dimension Doc (horizontal slice, one per dimension)

**Filename convention:** `dim-{slug}.md` (e.g., `dim-funding-capital.md`, `dim-hiring-gtm.md`, `dim-ai-agent-readiness.md`).
**Target length:** 60-150 lines. Substantive but not the briefing.
**Audience:** CMO who clicked "By Dimension → [this dimension]" from the briefing nav, OR an analyst diving into a specific lens.

This is a **self-contained mini-report with its own thesis**, NOT a data dump. A reader who opens just this file should get a complete strategic read of this dimension across all competitors.

---

## Required structure

### Header block

```
# [Dimension Name] — Across [Project] Competitor Set
> Generated {date} | Skill: `{competlab-skill-name}` | Verified URLs: [N] (via mcp__competlab__fetch_url)
> Coverage: [N] currently-monitored competitors + [M] consideration candidates (lighter-touch recon)
```

The header is brief — date + skill source + verification count + coverage. Don't elaborate methodology here.

### Section 1 — Mini-thesis (1 paragraph)

The dimension-specific strategic frame in one paragraph. Examples:

- **dim-funding-capital.md:** *"Bootstrap operators in [category] face increasing adjacent-VC pressure: [N] of [M] direct competitors are bootstrapped with combined [$X] ARR while one tier-up adjacent ([Y]) just raised [$Z] from [fund]. The funding-gap is itself a strategic signal — institutional capital is betting on the adjacent infrastructure layer."*
- **dim-hiring-gtm.md:** *"Three competitors are hiring against three distinct GTM bets in the same 30-day window: [A] for AI-engineering-led GTM, [B] for enterprise-sales build-out, [C] for sovereign-AI/government expansion. Co-incident moves across the rivals signal category-leadership build-out moment."*

This thesis is the dimension's strategic spine. The data below proves it.

### Section 2 — Per-competitor data sections

One subsection per Tier-1 competitor (full data) + a "Light-recon: AI-visible unmonitored" subsection (3 candidates, cheap-recon data only). Each subsection:

```
### [Competitor Name]
[2-4 sentences of dimension-specific narrative, with specific dates / amounts / signals]

**Concrete signals:**
- [signal 1 with date + source]
- [signal 2 with date + source]
- [signal 3 with date + source]
```

Numbers are mandatory. "Strong" without a number is vapor.

### Section 3 — Cross-competitor pattern callouts

The patterns ONLY visible because all competitors are looked at side-by-side in this dimension. 1-3 paragraphs.

Examples:
- "[N] of [M] vendors use [pattern]; the outliers signal..."
- "Co-incident moves across [vendors] in the same 30-day window suggest..."
- "Funding concentration: [Lead Fund] led both [vendor A] and [vendor B] rounds — thesis-level pattern."

### Section 4 — What this means for [brand]

The strategic implication, 1-3 paragraphs. Specific. Names options, doesn't hedge. End with 1-2 sentences naming what would change if the user took [recommended action] vs [counter-option].

### Section 5 — Data freshness + caveats

Short paragraph: which vendors had fresh data, which were partial, which were stale. **When a vendor's data is partial, the customer-facing frame is what that partiality means for THEIR brand — not what your monitoring pipeline experienced.**

Examples of customer-language framing for partial-data cases:

- *Vendor X's homepage is bot-protected → "Vendor X's site is invisible to AI training crawlers + comparison-engine bots → AI-mediated buyer research won't surface them; opportunity for your customer to surface where they're differently positioned."*
- *Vendor Y's sitemap is `<sitemapindex>`-rooted with deep child hierarchy → "Vendor Y has a deep content surface (thousands of URLs across sub-sitemaps); the at-a-glance count understates them — don't read it as content-thin."*
- *Vendor Z's pricing isn't extractable → "Vendor Z's pricing isn't AI-discoverable; buyers comparing prices in your category won't see Z's numbers — your customer's transparent pricing is a quiet competitive moat worth amplifying."*

The customer-facing phrasing for any partial-data case is simply *"signal unavailable for {vendor} in this run"* — plus the strategic implication the unavailability carries about that vendor (typically: invisible to AI training crawlers + agent toolkits = competitive AI Viz consequence for them, opportunity for your customer). Keep the language about the vendor, never about the data-collection pipeline.

### Section 5.5 (when applicable) — Categorical absence as first-class finding

**Banked from a real-world validation run.**

When this dimension returns thin data for ≥ 80% of vendors in the set, the absence itself carries strategic information for the customer — either a first-mover whitespace opportunity (signal genuinely doesn't exist anywhere in the category yet) or a channel-shift coverage note (signal lives somewhere other than this dimension's standard public surface).

**Customer-visible section heading: "Where this signal lives in your category"** — NOT "Categorical absence" or any template-internal section number like "5.5", which read as instrumented audit-trail vocabulary. Use a natural heading the customer would expect.

Structure the section as:

```
## Where this signal lives in your category

### What the signal looks like when present
[Specific example: "G2 listings with 50+ reviews per vendor, recurring complaint themes
around onboarding complexity, Trustpilot ratings differentiating SMB vs enterprise sentiment"]

### Where it actually lives for [this category]
[Where DOES the signal exist? E.g., "Customer voice for hospitality/STR tools lives on
Reddit r/AirBnB + STR Facebook groups + host conferences, not standard B2B SaaS review
platforms. To assess vendor reputation in this category, the high-signal channels are
the host-community discussions plus occasional referral threads on Twitter/X."]

### Forward signal worth watching
[Specific threshold the customer can scan for: "If any vendor crosses 50 G2 reviews
in the next 90 days, the category-discovery channel is shifting — worth reactivating
review-platform tracking."]
```

The customer reads this as practical intelligence about their category's actual signal-landscape, not as a methodology disclaimer about what didn't get measured.

### Section 6 (optional) — Forward signals to watch

If the dimension lends itself to threshold-monitoring (e.g., "if [vendor X]'s AI-rank delta crosses [threshold] in next 2 checks, the lead is at risk"), name the watch-numbers here. Optional but high-value when applicable.

---

## What to AVOID

- Don't restate raw API responses — synthesize per-vendor narrative
- Don't omit cross-competitor pattern callouts — those are the only-here-because-it's-multi-competitor value
- Don't hedge the mini-thesis — it should be assertive, supported by data below
- Don't include unverified Perplexity citations — `PATTERN-url-verification.md` Steps 1-4 must clear before claims surface
- Don't restate the briefing's strategic paths — that's L3's job; L2 evidences the dimensions
