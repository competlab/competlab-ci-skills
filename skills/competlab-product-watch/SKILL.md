---
name: competlab-product-watch
description: |
  Snapshots each monitored competitor's product surface beyond the homepage — structured changelogs, GitHub Releases, named-asset directories (MCP marketplaces, Claude Skills directories), API documentation versions, deprecation patterns. **Snapshot-only — does NOT produce velocity, diff, or alerts** (those are dimension-level features). Use when the user asks "what did competitor X ship recently", "product launches in [category]", "named recent product features", "changelog summary". Requires CompetLab MCP + Bash + mcp__competlab__fetch_url.
effort: low-medium
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors Bash mcp__competlab__fetch_url WebSearch
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Product Intelligence — Snapshot

You snapshot each monitored competitor's recent product launches from public changelogs, GitHub Releases, and named-asset directories.

## Adapter pattern (9 surfaces, day-1 coverage)

For each competitor, probe candidate URLs in order:

1. **Structured /changelog HTML** — Stripe `stripe.com/changelog`, Close `close.com/changelog` (clean ISO `<time datetime="">` attributes), Mollie, Plaid
2. **Developer-subdomain changelogs** — `developers.{domain}/changelog` (HubSpot, Pipedrive). Marketing-domain returns 404 for both; adapter must probe developer subdomain first.
3. **GitHub Releases API** — `api.github.com/repos/{org}/{repo}/releases` (Cline v3.82 May 1, v3.81 Apr 24, etc.)
4. **Blog-feed with category filter** — Warmy.io `/blog/?category=product-updates`, etc.
5. **Named-asset directory diff** — `{vendor}/claude-skills`, `{vendor}/mcp-marketplace`, `{vendor}/community-plugins` (vendor-published directories listing third-party agent integrations)
6. **Press / newsroom feeds** — `squareup.com/press`, `block.xyz/news`
7. **SPA/JS-rendered docs** — Adyen release notes (browser rendering required)
8. **Deprecation patterns** — Braintree "SDK v3 EOL 2026-07-14" cascade
9. **Sitemap-diff for feature-page additions** (banked from real-world validation) — for vendors with NO structured changelog (categorical pattern for hospitality + indie-operator categories), use CompetLab's `get_content_changelog` to detect new `/features/*`, `/integrations/*`, `/solutions/*` URLs surfacing in their sitemap over time. NEW feature-page additions ARE product launches even when not announced via /changelog. This is the only product-velocity signal that works for the ~50% of vendors without a structured changelog convention.

## Workflow

### Step 1: Identify competitors
list_projects + list_competitors.

### Step 2: For each competitor, try changelog URL patterns

```bash
for path in "${domain}/changelog" "${domain}/updates" "${domain}/release-notes" "${domain}/whats-new" "developers.${domain}/changelog" "${domain}/blog/category/product-updates"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 6 -A "$UA" "https://${path}")
  [[ "$code" == "200" ]] && echo "${path} → 200"
done
```

For successful URLs, use `mcp__competlab__fetch_url` with `cleanHtml:true` to extract recent entries.

### Step 3: Extract structured entries

For each changelog source, extract:
- Title (named feature/release if applicable, e.g., "AI Copilot 2.0")
- Date (ISO format if available)
- Description summary (1-2 sentences max per entry)
- Type (feature / fix / deprecation / API change / pricing change)

Cap at last 30-90 days per source. Limit to 10-20 entries per competitor max (don't dump full changelogs).

### Step 4: For vendors with GitHub Releases as primary changelog

```bash
curl -sS "https://api.github.com/repos/{org}/{repo}/releases?per_page=10" | jq '.[] | {tag_name, name, published_at, body}'
```

### Step 5: Detect coordinated-launch patterns

If a vendor has ≥3 same-week posts on the same topic + a product launch in the same window → classify as a single coordinated move, not 6 separate events. Example: Smartlead's April 1-8 2026 MCP-positioning push (5 same-week blog posts + 1 product post).

### Step 6: Synthesize per-vendor + cross-vendor

Per vendor:
- **Most recent NAMED launch + date** (e.g., "vendor X — AI Copilot 2.0, April 2026")
- **Recent feature drops** (last 30 days, top 5)
- **Release cadence proxy** (e.g., "vendor Y ships 3-4 named releases/month")
- **Strategic launches** (any named product line vs incremental features)
- **Deprecation signals** (API EOL, etc. — high-value for sales-aware buyers)

Cross-vendor:
- Coverage breakdown (X of N vendors have structured changelog)
- Velocity comparison (who's shipping most named features)
- Coordinated-move patterns (single multi-dim moves)
- Strategic-launch concentration (named product lines vs incremental)

## Output Structure

```
# Product Intelligence — [Category / Project]
> Generated [date] | Snapshot only — no velocity trend, no alerts
> Coverage: X of N vendors have structured changelog

## Summary
[Recent named launches, coverage range]

## Per-competitor
### [Competitor]
- Changelog source: [URL + format]
- Most recent NAMED launch: [name + date]
- Recent feature drops: [top 5 with dates]
- Cadence proxy: [N releases/month estimate]
- Strategic signals: [any coordinated moves]

## Cross-competitor patterns
[Velocity ranking, coordinated-launch detections, strategic-launch concentration]
```

## Why "snapshot only" — and when to promote to dimension

This skill captures CURRENT state. For:
- Velocity trends ("X has shipped 5 named launches/month, up from 2/month last quarter")
- Diff detection ("X added Y feature on date Z, removed feature W on date V")
- Per-vendor alerting

→ Requires persistent monitoring infrastructure → promote to dimension. Decision criteria: customer demand signal post-skill-ship. If 3+ customers ask "tell me when X ships" → promote.

## Decision Questions

1. *"Should we surface our own product velocity publicly via /changelog page?"* — if we don't have one
2. *"Is competitor X's recent coordinated move worth a tactical response, or are we positioned for a different bet?"*

## Error Handling

- **All 9 adapters return dry for a vendor** (no `/changelog`, no GitHub Releases, no named-asset directories, no `/features/*` sitemap-diff, etc.): record vendor as "no public product-velocity signal." For some categories this is universal (categorical-zero — surface as category whitespace, e.g., "no vendor in this category publishes a structured changelog → first-mover positioning opportunity").
- **`mcp__competlab__fetch_url` returns `bot_protection_detected` on a vendor's changelog/changelog-equivalent:** record as "changelog detected at [URL], content not accessible via automation" — that IS the finding (their product-velocity is invisible to AI training crawlers + comparison engines). Don't synthesize launches from a body the scanner couldn't parse.
- **Adapter returns content but no dated launches in last 90 days:** record as "snapshot stale — last dated release [date]." Don't pad with undated marketing blog posts to inflate the section.

## What NOT To Do

- Don't claim velocity trends from snapshot alone — say "current cadence" not "accelerating"
- Don't dump full changelogs (cap at top 5-10 per vendor)
- Don't conflate marketing blog posts with product launches — focus on named, dated feature drops
