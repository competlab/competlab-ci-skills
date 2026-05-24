---
name: competlab-ai-ecosystem
description: |
  Measures EXTERNAL developer-ecosystem signals around each competitor — GitHub organization meta, top-starred repos, npm/PyPI download volumes, community-built MCP servers (not first-party), integration marketplace presence, Claude Skills directories, agent-toolkit repos. Complements competlab-agent-adoption (which measures FIRST-PARTY signals). Use when the user asks "developer adoption", "GitHub presence", "npm downloads", "marketplace presence", "agent-ecosystem strength", "community signals around [competitor]". Requires CompetLab MCP + Bash (GitHub + npm + PyPI API, mostly unauth) + WebSearch + Perplexity with URL verification.
effort: low-medium
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors Bash mcp__competlab__fetch_url mcp__perplexity__perplexity_ask WebSearch
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# AI Ecosystem Intelligence

You measure what the dev community is BUILDING AROUND each competitor (external signal). Distinct from `competlab-agent-adoption` which measures FIRST-PARTY agent infrastructure.

## Workflow

### Step 1: Identify competitors
list_projects + list_competitors.

### Step 2: For each competitor, probe public APIs (all unauth-OK)

**GitHub org meta:**
```bash
curl -sS https://api.github.com/orgs/{slug} | jq '{public_repos, followers, created_at}'
```
Try slug variants: `{brand}`, `{brand}-inc`, `{brand}io`, `{brand}HQ` (BetterStackHQ style), `{brand}-ai`.

**Top-N starred repos:**
```bash
curl -sS "https://api.github.com/search/repositories?q=org:{slug}&sort=stars" | jq '.items[0:5] | .[] | {name, stargazers_count, description}'
```

**MCP/agent search:**
```bash
curl -sS "https://api.github.com/search/repositories?q={brand}+mcp+in:name" | jq '{total_count, items: .items[0:3]}'
```
And same for: `{brand}+agent-toolkit`, `{brand}+claude-skill`, `{brand}+claude-connector`.

**npm downloads:**
```bash
curl -sS "https://api.npmjs.org/downloads/point/last-month/{pkg}" | jq '.downloads'
```
Try variants: `{brand}`, `@{brand}/sdk`, `@{brand}/{brand}`, `{brand}-sdk`, `{brand}-client`, `{brand}-api`.

**PyPI downloads:** check via `https://pypistats.org/api/packages/{pkg}/recent` (or pepy.tech for richer data).

### Step 3: For brands with no obvious public surface (e.g., bootstrapped operator with no GitHub org)
Use Perplexity to confirm "X has no GitHub presence; their developer surface is API-only / closed" — that's itself an Ecosystem signal in a category where peers DO have GitHub presence.

### Step 4: URL-verify any Perplexity-returned GitHub URLs
Per validation in the CRM category: Perplexity hallucinates GitHub URLs with citation-grade star counts. ALL claimed GitHub URLs MUST be URL-verified via `mcp__competlab__fetch_url` OR direct `api.github.com/repos/{owner}/{repo}` check before surfacing in output.

### Step 5: Marketplace presence (lighter pass)
HubSpot App Marketplace, Salesforce AppExchange, VS Code Marketplace, Anthropic MCP catalog, Smithery.ai (where applicable to category). One quick search each.

### Step 6: Synthesize per-vendor + cross-vendor

Per vendor:
- GitHub org: repo count, follower count, created year, top-N repos by stars
- npm monthly downloads (with package names verified-real)
- Community-built MCP servers found (with star counts, verified-real)
- Marketplace listings (where applicable)
- Verdict: "rich developer ecosystem" / "moderate" / "early-stage" / "no public surface"

Cross-vendor:
- Coverage: X of N vendors have public GitHub org
- Volume comparison (e.g., "category-leading vendor publishes multi-million npm/month while niche peer ships single-digit downloads — orders-of-magnitude gap is itself the developer-ecosystem read")
- Pattern detection (e.g., "community-built MCP demand outpaces official builds for X — indicates strong dev-pull")
- Strategic gaps (e.g., "vendor X has Series B funding but zero public dev surface — atypical")

## Output Structure

```
# AI Ecosystem — [Category / Project]
> Generated [date] | X of N citations URL-verified via GitHub API / fetch_url

## Summary
[Coverage breakdown, volume range, strategic gap signals]

## Per-competitor
### [Competitor]
- GitHub: org [repos/followers/created] / top-N repos / NONE (with signal interpretation)
- npm: [pkg → downloads/month] for top SDKs / NO SDK FOUND
- Community MCP servers: [list of verified-real repos with stars] / NONE FOUND
- Marketplace: [Hub/Salesforce/VS Code if relevant]
- Verdict: [rich / moderate / early / none]

## Cross-competitor patterns
[Coverage gap, volume orders-of-magnitude difference, dev-pull signals]
```

## Decision Questions

1. *"Do we want to build a public GitHub org if we don't have one yet?"* — material if we're in a category where peers have one
2. *"Should we encourage community-built MCP servers (link to community-built ones from our docs like Smartlead does) or only have first-party?"*

## Error Handling

- **GitHub API 403 rate-limit (60/hr unauth):** complete the vendors already probed; record remaining as "GitHub data unavailable this run." Suggest authenticated mode (`GH_TOKEN`) in output if user has it. Don't synthesize from cached or stale data.
- **npm / PyPI registry 5xx:** retry once with 10s delay; if persistent, mark "package registry data unavailable" rather than dropping vendor silently.
- **Perplexity citation 404 / repo URL hallucinated:** strip silently, log to `_internal/url-verification-log.md`. Real-world validation found ~5 of 7 Perplexity-cited GitHub repo URLs were fabricated (with citation-grade confidence). The skill MUST verify every `github.com/X/Y` URL via `api.github.com/repos/X/Y` (HTTP 200 + matching owner) before surfacing.
- **Vendor has zero GitHub org / zero npm presence:** record as "no developer-ecosystem signal detected." Common for B2B SaaS without a developer surface; surface as classification finding rather than implying failure.

## What NOT To Do

- Don't list GitHub URLs without verifying they exist (Perplexity hallucination risk observed in real-world validation).
- Don't conflate first-party with community-built — they're different signals. First-party = agent-adoption skill. Community-built + npm/marketplace = ai-ecosystem skill.
- Don't over-weight a single repo — a 9k-star OSS competitor under another org (like bluewave-labs/Checkmate for UptimeRobot) means a competitor is filling YOUR brand's GitHub surface.
