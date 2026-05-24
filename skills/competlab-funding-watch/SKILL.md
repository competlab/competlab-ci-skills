---
name: competlab-funding-watch
description: |
  Surfaces recent funding events, ownership changes, ARR estimates, M&A activity, executive transitions, and category-adjacent capital pressure for each monitored competitor. Adapts output per-vendor based on funding mode (Public-company, PE-owned, Bootstrap, VC-stage, M&A-volatile). Critical for strategic context (capital intensity = competitor's ability to outspend/outscale you). Use when the user asks "funding posture", "competitor funding", "category capital pressure", "is competitor X well-funded", "ARR estimates", "recent rounds in [category]". Requires CompetLab MCP + Perplexity MCP + mcp__competlab__fetch_url for URL verification.
effort: medium
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors mcp__competlab__fetch_url mcp__perplexity__perplexity_ask WebSearch
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Funding & Capital Intelligence

You surface recent funding events + capital posture for each monitored competitor. Adapt output per the 5 funding modes — each mode requires different signals.

## The 5 funding modes (classify each vendor first)

1. **Public-company mode** — lead with market cap, earnings, guidance, share repurchases (e.g., "[$X]B market cap, [latest-quarter] [$Y]M revenue [+Z%] YoY, [$W]M share buyback authorized")
2. **PE-owned mode** — lead with ownership history + no-new-rounds signal (e.g., "[Vendor] acquired by [PE firm] in [year]; no new rounds since")
3. **Bootstrap mode** — lead with ARR estimates from public-aggregator sources (GetLatka, Prospeo, Growjo) (e.g., "$0 disclosed funding, ~$XM ARR estimate per GetLatka, recent M&A activity")
4. **VC-stage mode** — lead with round history + valuation + lead investor (e.g., "[$X]M across [N] rounds, Series [letter] [$Y]M led by [investor] at [$Z]B valuation")
5. **M&A-volatile mode** — three-way sequencing matters more than amount (e.g., "[vendor]'s 2025 sequence: [acquirer A] [$X]B announced [date] → regulatory block on IP carve-out → [acquirer B] [$Y]B reverse acquihire [date] → [acquirer C] acquired remaining IP [date]")

## Workflow

### Step 1: Identify competitors + classify
Pull list_projects + list_competitors. For each, infer mode from quick Perplexity check or known status.

### Step 2: Per-competitor Perplexity research (with URL verification)

For each, one focused query:
> "For [company name in {category}] in {current year}: give (1) funding posture + most recent round/M&A with dates, (2) ARR estimate if known, (3) headcount or recent hiring direction signals, (4) recent exec transitions, (5) any category-adjacent acquirer/investor activity. Cite specific sources."

### Step 3: URL-verify every citation

Per `PATTERN-url-verification.md`: any Perplexity-returned URL gets probed via `mcp__competlab__fetch_url` with `bodyNeeded:true, cleanHtml:true` before surfacing in skill output. Drop hallucinated URLs. Validate cited amounts against source page where possible.

Common URL types: press releases (companies' own), Crunchbase (often 403-blocked), GetLatka (often accessible), TechCrunch + The SaaS News + sector trades, fund websites (Sprints Capital, Sequoia, etc.).

### Step 4: Synthesize per-vendor + cross-competitor

Per vendor:
- Funding mode (one of 5 above)
- Most recent round/M&A: amount, date, lead investor, valuation if disclosed
- Total funding to date
- ARR estimate (with source/year)
- Headcount + direction (growing/flat/shrinking with source)
- Exec transitions in last 12 months
- Notable signals (e.g., "8+ years funding-quiet" or "post-merger integration mode")

Cross-vendor:
- Category funding pattern: bimodal (well-funded + bootstrapped) / converging / cooling
- Recent M&A activity in category
- Adjacent-VC pressure (vendors in tier-up category that competitors will eventually compete against)
- Investor concentration (e.g., "Balderton led both Vendor X + Vendor Y rounds")

## Output Structure

```
# Funding & Capital — [Category / Project]
> Generated [date] | X of N citations URL-verified

## Summary
[Category funding pattern + cross-cutting investor signals]

## Per-competitor
### [Competitor] — [Funding mode]
- Most recent: [amount + date + lead]
- Total: [$X]
- ARR: [if known, with year + source]
- Headcount: [if known, with trend]
- Notable: [posture signal — growth-mode, mature, stale, etc.]

## Cross-competitor patterns
[Bimodal/converging signals, M&A clusters, investor concentration]
```

## Decision Questions

1. *"Is the category's adjacent-VC pressure (e.g., Brevo $500M raise next door) a threat or an acquisition opportunity for us?"*
2. *"Are we benchmarking against the bootstrapped lean operator or the VC-stage growth bet — and is our current capital posture aligned?"*

## Error Handling

- **Perplexity returns "I don't have enough information" or thin/dateless results:** record vendor as "no public funding signal" — frame as classification finding (likely bootstrap or pre-disclosure) rather than fabricating amounts. Don't push for an answer Perplexity can't substantiate.
- **Perplexity citations 404 / URL verification fails:** strip silently, log to `_internal/url-verification-log.md`. Categorical absence of verifiable citations across all vendors flips category-classification toward "bootstrap-dominant" (categorical-zero as positioning signal).
- **Crunchbase / PitchBook citations bot-blocked (403 / CloudFront):** these platforms reliably block scrapers — record as "secondary-source verification unavailable" and rely on press release / vendor blog / SEC filing citations only.

## What NOT To Do

- Don't fabricate funding amounts. URL Verification is mandatory.
- Don't quote Crunchbase if you couldn't actually verify (Crunchbase typically 403-blocks scrapers).
- Don't extrapolate ARR from headcount without source — most "estimated $X ARR" claims are speculative.
