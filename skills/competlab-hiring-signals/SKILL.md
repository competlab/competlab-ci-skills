---
name: competlab-hiring-signals
description: |
  Probes hiring + GTM-motion signals for each monitored competitor via public ATS APIs (Ashby, Greenhouse, Lever, Workable) + LinkedIn unauth fallback + Perplexity for exec transitions. Three-condition feasibility: (1) LinkedIn employer-brand presence, (2) ATS adoption (Ashby/Greenhouse/Lever), (3) vendor-name uniqueness. Use when the user asks "competitor hiring", "is X expanding sales motion", "competitor headcount trend", "GTM motion shift signals", "exec transitions". Most reliable for Series-B+ private + public vendors; less for bootstrapped operators without public ATS. Requires CompetLab MCP + Bash + Perplexity + URL verification.
effort: medium
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors Bash mcp__perplexity__perplexity_ask mcp__competlab__fetch_url WebSearch
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Hiring & GTM Intelligence

You probe hiring signals across public ATS APIs + LinkedIn unauth + Perplexity to infer GTM-motion shifts, headcount velocity, executive transitions.

## Pre-scan vendor-profile filter (Step -1, banked from a real-world validation run)

**Before running ATS probes, check if the vendor is even an ATS candidate.**

If the vendor profile shows ANY of these → skip ATS probes entirely (saves 30-60s per vendor):
- **Employee count < 10** (per any prior knowledge or LinkedIn unauth quick-check) — indie operator, no public ATS likely
- **Bootstrapped category with categorical no-ATS pattern** detected from sibling skills:
  - Hospitality / vacation rental tools
  - Indie hosting tools
  - Solo-founder AI tools
- **Vendor profile indicates founding within last 12 months** — too young for ATS adoption

For skipped vendors, output: "ATS probe skipped — vendor profile (indie/small/young) indicates ATS-data unlikely; founder-channel monitoring required if signal needed."

Saves time + token budget on guaranteed-null probes. Surfaced from a real-world validation run: 9 of 9 hospitality vendors had no ATS, but the orchestrator burned ~30-90s × 9 vendors × 4 ATS platforms anyway.

## Three-condition feasibility probe (Step 0)

For each vendor NOT pre-filtered out at Step -1, check which of these apply:
1. **LinkedIn employer-brand presence** — Series-B+ private + public almost always have it; bootstrapped operators often don't
2. **ATS adoption** — Ashby (api.ashbyhq.com), Greenhouse (boards-api.greenhouse.io), Lever (api.lever.co), Workable
3. **Vendor-name uniqueness** — "HubSpot" / "Salesloft" collide as job-skill keywords; "Cursor" / "Pipedrive" / "Apollo.io" don't

If 0 of 3 apply → flag "hiring data inaccessible via free surface; founder-channel monitoring required."

## Workflow

### Step 1: Identify competitors
list_projects + list_competitors.

### Step 1.5: Generic-word slug name-collision verification (banked from real-world validation)

**Critical for vendors with generic-word brand names** (`folio`, `notion`, `linear`, `arc`, `bolt`, `figma`, `loom`, etc.) — ATS slugs that match these brand names are HIGH-RISK for name collision. A real-world validation run had an Ashby hit on `folio` that was correctly excluded because the slug could match dozens of "Folio" companies (folio travel, folio finance, folio publishing, etc.).

**Before including any single-platform ATS hit on a generic-word slug, verify ownership via ONE of:**
1. **LinkedIn company URL pattern match** — does the ATS-hit's company-page URL match `linkedin.com/company/{vendor-canonical-slug}`?
2. **Ashby company-page URL check** — `ashby.com/companies/{slug}` page exists AND mentions vendor-specific product name?
3. **Job-listing body keyword check** — does the listing body text contain vendor-specific product names, customer logos, or domain references?

If NONE verify → flag-and-EXCLUDE the hit. Better to under-report than mis-report a strategic competitor's hiring trajectory.

### Step 2: ATS adapter probes (parallel where possible)

For each competitor, try slug variants:
```bash
# Ashby
curl -sS https://api.ashbyhq.com/posting-api/job-board/{slug} | jq '.jobs | length'

# Greenhouse
curl -sS https://boards-api.greenhouse.io/v1/boards/{slug}/jobs | jq '.jobs | length'

# Lever
curl -sS "https://api.lever.co/v0/postings/{slug}?mode=json" | jq 'length'

# Workable
curl -sS https://apply.workable.com/api/v3/accounts/{slug}/jobs | jq '.total'
```

Try slug variants: `{brand}`, `{brand}-inc`, `{brand}inc`. For successful response, extract job count + role mix.

### Step 3: LinkedIn unauth fallback (where ATS doesn't yield)

Perplexity query: "How many open jobs does [Company] have on LinkedIn? What are the top role categories? Filter by employer-ID to avoid name-collision pollution."

### Step 4: Role-mix + geography breakdown

For successful ATS data, extract:
- Total jobs
- Role categories (eng vs sales vs marketing vs CS vs ops)
- Geography mix (SF / NYC / remote / international)
- Notable single-role signals (e.g., "Director of Sales — Enterprise" = enterprise GTM motion; "GTM Engineer" × N = AI-engineering-led GTM)

### Step 5: Exec transitions

Perplexity query (recency=year): "Has [Company] had any C-level transitions (CEO, CTO, CMO, CRO, COO) in last 12 months? Include incoming + outgoing + dates if possible."

URL-verify any cited press releases / Bloomberg articles via `mcp__competlab__fetch_url`.

### Step 6: Headcount trend (where available)

GetLatka often has "X employees, up/down from Y in [year]" data. Perplexity surfaces it. Always URL-verify the GetLatka page.

### Step 7: Synthesize per-vendor + cross-vendor

Per vendor:
- **Visible hiring surface:** which sources yielded data (ATS / LinkedIn / Perplexity / careers page) — note gaps
- **Job count + role mix** (engineering ratio, sales ratio, GTM signals)
- **Geography concentration** (HQ / remote / international expansion signals)
- **Recent exec moves** (with dates + sources)
- **Headcount trend** (up/down with year-on-year delta)
- **GTM motion inference** (engineering-led growth / sales-led / hybrid / efficiency mode)

Cross-vendor:
- Hiring intensity comparison (who's expanding fastest)
- Function-mix patterns (e.g., "3 vendors hiring against 3 distinct GTM bets")
- Geographic patterns (e.g., "consolidation in SF" or "international expansion signal")
- Hiring-data coverage gaps (where free surface didn't yield)

## Output Structure

```
# Hiring & GTM — [Category / Project]
> Generated [date] | Coverage: X of N vendors yielded ATS or Perplexity data

## Summary
[Hiring intensity range, GTM motion patterns]

## Per-competitor
### [Competitor]
- Hiring surface: [ATS slug / LinkedIn / Perplexity / no data]
- Total jobs: [N] | Role mix: [eng X / sales Y / CS Z]
- Geography: [HQ + notable expansion signals]
- Headcount trend: [up/down with delta + year]
- Exec transitions: [list with dates] / [none]
- GTM inference: [enterprise build-out / efficiency mode / etc.]

## Cross-competitor patterns
[Hiring intensity ranking, GTM motion divergence, geographic patterns]
```

## Decision Questions

1. *"Are we benchmarking our hiring trajectory against the bootstrapped efficient operator or the VC-funded enterprise build-out?"*
2. *"Should we surface our own hiring data publicly (ATS, careers page) to signal scale + investment?"*

## Error Handling

- **ATS API returns 404 / no public feed (Ashby/Greenhouse/Lever/Workable):** record vendor as "no public ATS detected." For <10-employee bootstrap operators this is expected (per Step -1 vendor-profile pre-scan); for established vendors it's itself a signal (likely no GTM motion or hiring through closed channels).
- **ATS API 5xx / timeout:** retry once with 10s delay; if persistent, mark "ATS detected but data unavailable" rather than dropping vendor silently.
- **LinkedIn unauth blocked / name-collision pollution:** when LinkedIn returns mixed-employer noise for the vendor name, fall back to vendor career-page direct fetch via `mcp__competlab__fetch_url`. If even careers page yields nothing actionable (no role listings on page), mark "LinkedIn unauth + careers page yielded no clean signal" rather than reporting collision-polluted counts.
- **Perplexity exec-transition claim with no verifiable citation:** strip silently. Exec moves are reputationally sensitive — never publish without press release / vendor blog / LinkedIn post URL verified.

## What NOT To Do

- Don't report LinkedIn job counts without checking for name-collision pollution (LinkedIn unauth for "HubSpot" returns mostly OTHER companies requiring HubSpot experience).
- Don't infer exec transitions from rumor — verify against press releases.
- Don't claim "hiring sprint" from a single week's job count delta — need 30-60-day rolling view (which this skill snapshots; for trend, dimension promotion needed).
