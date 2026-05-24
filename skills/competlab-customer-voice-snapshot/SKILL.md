---
name: competlab-customer-voice-snapshot
description: |
  Snapshots competitor presence on review platforms (G2 + Capterra + Trustpilot) and recent complaint themes. **Snapshot-only — limited coverage by design** because review-platform bot-blocking is universal (G2 + Trustpilot return 403 to all WebFetch attempts). Uses Perplexity-grounded answers as primary source, with URL verification for citations. Use when the user asks "what do customers say about competitor X", "G2 reviews for [competitor]", "complaint themes for [competitor]". For trend / velocity / sentiment-delta — requires dimension promotion (not this skill). Requires CompetLab MCP + Perplexity MCP + URL verification.
effort: low
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors mcp__perplexity__perplexity_ask mcp__competlab__fetch_url
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Customer Voice — Snapshot

You produce on-demand snapshot of competitor review-platform presence + recent complaint themes. **Limited scope by design.**

## Why limited scope

- G2 product-page WebFetch → HTTP 403 universally (battletested 24+ product pages, 6/6 categories)
- Trustpilot → HTTP 403 identically
- Capterra → HTTP 200 sometimes but wrong-product redirects (catalog-ID collision)

Perplexity recovers snapshot counts + ratings for 25-100% of vendors depending on category, but velocity / sentiment-trend / themes-delta is structurally invisible without persistent scraping.

For:
- Real-time review-velocity monitoring → dimension promotion required
- Sentiment-trend reversal detection → dimension promotion required
- Recurring complaint themes with monthly delta → dimension promotion required

This skill: snapshot. Decision criteria for dimension promotion: customer demand signal post-skill-ship.

## Workflow

### Step 1: Identify competitors
list_projects + list_competitors.

### Step 2: For each competitor, Perplexity-snapshot query

```
"For [Company] in [Category] in 2026:
(1) G2: review count + average rating + 1-2 recurring complaint themes from recent reviews
(2) Capterra: review count + average rating
(3) Trustpilot: review count + average rating (if B2C-adjacent like Stripe, Klarna)
(4) Any Reddit/HN/X recurring discussion themes
Cite specific sources for each claim."
```

### Step 2.5: Categorical-absence early-halt rule (banked from real-world validation)

**If the first 2-3 Perplexity queries return "no data found" / "no G2 presence detected" for ALL 3 platforms** — the category likely doesn't review on standard B2B SaaS platforms.

Examples of categorical-absence patterns:
- **Hospitality / vacation rental tools** — buyers find these via Reddit r/AirBnB, r/Hosting, r/vacationrentals, STR Facebook groups, host conferences. NOT via G2 / Capterra / Trustpilot.
- **Indie-developer tools** (early-stage AI tooling) — buyers find via Hacker News, Twitter, Reddit r/ChatGPTCoding. NOT via standard B2B SaaS platforms.

**Action on categorical absence:**
1. Halt remaining Perplexity queries (don't waste budget on 9 identical null returns).
2. Document the finding in output: "Category absent from G2/Capterra/Trustpilot — buyers discover via [actual channels for this category]."
3. Optionally suggest alternative channels for customer-voice signal (Reddit search via Perplexity recency=month, conference-presence detection, etc.) but mark these as out-of-scope for the snapshot skill.
4. Return early — don't synthesize per-vendor docs with all "no data" cells.

### Step 3: URL-verify every cited source

Per `PATTERN-url-verification.md`: every Perplexity-returned URL gets probed via `mcp__competlab__fetch_url` with `cleanHtml:true` before surfacing in output. Drop citations that 404. Validate count claims against source page where possible (G2 page may be 403-blocked even via fetch_url — flag honestly when can't verify).

### Step 4: For B2C-adjacent vendors, split B2B vs consumer reviews

For a B2C-adjacent payments / fintech vendor, expect the typical signature: thousands of B2B G2 reviews + tens-of-thousands of consumer Trustpilot reviews + small Capterra tail. **Split the output** — B2B G2 numbers and consumer Trustpilot numbers represent different signal classes.

The consumer-review tail is often orders of magnitude larger than the B2B count, AND consumer sentiment frequently runs lower (1-2★ Trustpilot averages are common for support-friction-prone vendors). When you see this pattern, the B2B signal is the procurement-trust read; the consumer signal is the brand-reputation read; both matter, neither substitutes for the other.

### Step 5: For developer-tool categories, Perplexity Reddit/HN

For categories like AI-coding where G2 surface is thin (validation runs in this category yielded 0 of 8 vendors with G2 data), Perplexity Reddit/HN recovery is rich (specific dated discussion posts with upvote counts). Use as primary signal for those categories.

### Step 6: Synthesize per-vendor + cross-vendor

Per vendor:
- G2 count + rating (or "blocked, can't verify")
- Capterra count + rating
- Trustpilot count + rating (if B2C-adjacent)
- Recent recurring complaint themes (1-2 max)
- Recent recurring praise themes (1-2 max if useful)
- Coverage gaps (which platforms had no data)

Cross-vendor:
- Review-volume comparison (e.g., "established competitor 5,000+ G2 vs new entrant 0 G2 reviews")
- Highest-rated / lowest-rated competitor signal
- Category complaint patterns (e.g., "all vendors in this category get complaints about admin complexity")

## Output Structure

```
# Customer Voice — [Category / Project]
> Generated [date] | Snapshot only | Coverage: X of N vendors yielded G2 data via Perplexity

## Summary
[Review volume range, top complaint themes across category]

## Per-competitor
### [Competitor]
- G2: [count] reviews, [rating]★ | [main complaint themes — 1-2]
- Capterra: [count] / [rating] | [if different from G2]
- Trustpilot: [count] / [rating] | [if B2C-adjacent]
- Reddit/HN: [recent discussion themes if developer-tool category]

## Cross-competitor patterns
[Volume comparison, category-wide patterns]

## Coverage gaps
[Which vendor × platform pairs returned no data]
```

## Decision Questions

1. *"Should we run a G2/Capterra review-velocity campaign?"* — if we're under-represented vs category leaders
2. *"Are recurring complaint themes for top competitors something we can target in messaging?"*

## Error Handling

- **Perplexity returns "no data" on first 2-3 queries for a vendor:** invoke the categorical-absence early-halt — stop further probing, record vendor as "no review-platform presence detected." Reflects either nascent vendor or category where reviews live elsewhere (Reddit / HN / conferences).
- **G2 / Capterra / Trustpilot URLs bot-blocked (403/CloudFront on `fetch_url` verification):** expected behavior — review platforms reliably block automated scrapers. Record vendor as "G2 presence detected per Perplexity citation, count + rating not independently verifiable" rather than fabricating numbers from unverified output.
- **Perplexity returns review count + rating without verifiable URL:** strip the unverified numbers; report only the qualitative complaint themes Perplexity surfaced (those are recovery-tolerant). Never publish a specific review count without URL verification — Perplexity often hallucinates plausible-sounding counts from category averages.

## What NOT To Do

- Don't fabricate review counts. URL Verification is mandatory.
- Don't claim sentiment trends from snapshot alone — say "current complaint themes" not "increasing complaints"
- Don't include G2 numbers Perplexity returned without verifying against G2's actual page (Perplexity may overstate or invent based on category-association)
