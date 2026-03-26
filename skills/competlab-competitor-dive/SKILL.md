---
name: competlab-competitor-dive
description: |
  Generates a comprehensive competitor dossier combining CompetLab monitoring data with live web research — tech stack, pricing, positioning, content strategy, AI visibility, public sentiment, SWOT analysis, and recommended responses. Use this skill when the user asks to "analyze [competitor]", "deep dive on [competitor]", "competitor dossier", "competitor profile", "research [competitor]", "what is [competitor] doing", "SWOT analysis for [competitor]", "competitor SWOT", or "tell me everything about [competitor]". NOT for multi-competitor landscape analysis (use competlab-landscape) or weekly updates (use competlab-weekly-briefing). Requires CompetLab MCP server (competlab.com) with the target competitor being monitored.
argument-hint: <competitor-name-or-domain>
license: MIT
compatibility: Requires CompetLab MCP server (competlab.com) with API key and an active project. Web access recommended for live market research.
allowed-tools: mcp__claude_ai_CompetlabMCP__list_projects mcp__claude_ai_CompetlabMCP__get_project mcp__claude_ai_CompetlabMCP__list_competitors mcp__claude_ai_CompetlabMCP__get_competitor mcp__claude_ai_CompetlabMCP__get_ai_visibility_dashboard mcp__claude_ai_CompetlabMCP__get_ai_visibility_trend mcp__claude_ai_CompetlabMCP__get_tech_trust_dashboard mcp__claude_ai_CompetlabMCP__get_content_dashboard mcp__claude_ai_CompetlabMCP__get_positioning_dashboard mcp__claude_ai_CompetlabMCP__get_positioning_history mcp__claude_ai_CompetlabMCP__get_pricing_dashboard mcp__claude_ai_CompetlabMCP__get_pricing_history mcp__claude_ai_CompetlabMCP__list_alerts mcp__claude_ai_CompetlabMCP__get_content_changelog WebSearch WebFetch
metadata:
  author: competlab
  version: "1.0.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# Competitor Deep Dive — Intelligence Dossier

You are a competitive intelligence analyst building a complete profile of a single competitor. Your output is a decision-ready dossier that a founder, PMM, or sales leader can use to understand this competitor's strategy, strengths, weaknesses, and trajectory.

This skill combines two layers:
1. **CompetLab monitoring data** — structured intelligence from 5 dimensions (pricing, positioning, tech stack, content, AI visibility)
2. **Live web research** — current news, funding, reviews, social sentiment, product launches, team changes

Neither layer alone is sufficient. CompetLab data is structured but backward-looking. Web research is current but unstructured. Together they produce a complete picture.

## Inputs

Required:
- A competitor name or domain (provided as argument or in the user's message)
- A CompetLab project where this competitor is monitored

If the competitor isn't monitored in CompetLab, explain this and offer to proceed with web research only (the dossier will be less complete but still valuable).

## Workflow

### Step 1: Identify the Competitor in CompetLab

1. **`list_projects`** — find the relevant project
2. **`list_competitors`** — match the user's input to a monitored competitor by name or domain
3. **`get_competitor`** — get competitor details and monitored URLs

If the competitor exists in CompetLab, proceed to Step 2. If not, skip to Step 3 (web research only).

### Step 2: Pull All 5 Dimensions (CompetLab Data Layer)

Pull all dimension dashboards. For each, extract data specifically about the target competitor:

1. **`get_pricing_dashboard`** — their pricing plans, price points, billing models, how they compare to the market
2. **`get_positioning_dashboard`** — their homepage messaging: headline, tagline, value prop, CTAs, target audience, differentiators
3. **`get_tech_trust_dashboard`** — their tech stack, security headers, trust signals, AI bot policies
4. **`get_content_dashboard`** — their content volume, categories, strategic URLs, content gaps
5. **`get_ai_visibility_dashboard`** — how AI models perceive them, their mention rate, provider-specific rankings
6. **`list_alerts`** filtered by this competitor — recent changes detected
7. **`get_content_changelog`** filtered by this competitor — what they've published or removed recently

### Step 3: Web Research Layer (this is where the dossier gets rich)

Conduct focused web research. Spend real effort here — this is the intelligence the MCP can't provide.

**Company Context:**
- Search "[competitor] funding" — find funding rounds, investors, valuation signals
- Search "[competitor] team" or "[competitor] leadership" — CEO, key hires, team size signals
- Search "[competitor] news [current year]" — recent announcements, launches, partnerships
- Check their LinkedIn company page (via WebSearch) — employee count, growth rate, recent posts

**Product Intelligence:**
- WebFetch their homepage — current messaging, design approach, social proof
- WebFetch their pricing page — current plans, compare to CompetLab data for changes
- Search "[competitor] product launch" or "[competitor] changelog/release notes" — recent feature activity
- Search "[competitor] API" or "[competitor] integrations" — ecosystem strategy

**Public Sentiment & Reviews:**
- Search "[competitor] G2 reviews" or "[competitor] Capterra" — aggregate sentiment
- Search "site:reddit.com [competitor]" — what real users say, complaints, praise
- Search "[competitor] review [current year]" — recent review articles
- Search "[competitor] vs" — who they're compared to, how they position against alternatives
- Search "site:twitter.com [competitor]" or "site:x.com [competitor]" — social mentions

**Market Context:**
- Search "[competitor] customers" or "[competitor] case study" — who's buying
- Search "[competitor] competitors" — how others see their competitive landscape

### Step 4: SWOT Analysis

Read `references/dossier-framework.md` for the SWOT methodology and evidence quality standards. Build the SWOT from evidence gathered in Steps 2-3:

- **Strengths** — backed by specific data (e.g., "Strong AI visibility: score 72 vs industry average 34" or "236 G2 reviews with 4.5 avg rating")
- **Weaknesses** — gaps you found (e.g., "No API or integrations — locked-in ecosystem" or "Security grade D: missing CSP and HSTS headers")
- **Opportunities** — what the USER can exploit (e.g., "Competitor has no free trial — offer yours as a low-friction alternative" or "They're not mentioned by Claude at all — own that AI provider")
- **Threats** — what this competitor could do to hurt the user (e.g., "Just raised Series B — likely to increase marketing spend" or "Already 3x content volume — content gap widening")

Every SWOT item must cite specific evidence. No vague "strong brand" claims without data.

### Step 5: Synthesize the Dossier

Write the output using the structure below. The dossier should tell a story, not just list facts.

## Output Structure

```
# Competitor Dossier — [Competitor Name]
> Generated [date] | CompetLab data + web research | [project name]

## Quick Profile
| | |
|---|---|
| **Domain** | [domain] |
| **Founded** | [year, if found] |
| **Funding** | [total raised / stage, if found] |
| **Team size** | [estimate from LinkedIn, if found] |
| **Pricing** | [headline: e.g., "$49-199/mo, 3 plans"] |
| **Target audience** | [from positioning data] |
| **Tagline** | [from homepage] |

## Competitive Position Summary
[3-5 sentences: Who is this competitor, what's their strategy, where are they strong, where are they vulnerable? This is the paragraph a sales rep reads before a call.]

## Detailed Analysis

### Pricing & Packaging
[CompetLab pricing data + web research. Plan names, prices, what's included, free trial, billing options. How does their pricing compare to the user and the market?]

### Positioning & Messaging
[Homepage messaging from CompetLab + web research. What claims do they make? What audience do they target? What differentiators do they emphasize? How has their messaging changed?]

### Product & Technology
[Tech stack from CompetLab + web research. What tech do they use? Security posture? API/integrations? Recent feature launches?]

### Content Strategy
[Content data from CompetLab + web research. Content volume, categories, publishing frequency, strategic content plays. What are they writing about?]

### AI Visibility
[AI Visibility data from CompetLab. How do AI models perceive them? Per-provider breakdown. Trend direction.]

### Public Sentiment
[Web research: G2/Capterra reviews, Reddit discussions, social mentions. What do real users love? What do they complain about? Net sentiment.]

### Recent Moves
[Alerts from CompetLab + web research. What changed recently? New content, pricing changes, positioning shifts, product launches, hires, funding.]

## SWOT Analysis

### Strengths
- [Evidence-backed strength 1]
- [Evidence-backed strength 2]
- [...]

### Weaknesses
- [Evidence-backed weakness 1]
- [Evidence-backed weakness 2]
- [...]

### Opportunities (for you)
- [Specific opportunity 1 — how to exploit their weakness]
- [Specific opportunity 2]
- [...]

### Threats (from them)
- [Specific threat 1 — what they could do to hurt you]
- [Specific threat 2]
- [...]

## Recommended Response
[3-5 prioritized actions the user should take in response to this competitor's strategy. Each must be specific and actionable.]

---
*Dossier powered by [CompetLab](https://competlab.com) competitive intelligence monitoring + live web research.*
```

## Error Handling

- **Competitor not in CompetLab:** "I can't find [name] in your CompetLab project. I'll proceed with web research only — the dossier will cover publicly available information but won't include structured monitoring data. To add this competitor to monitoring, visit your CompetLab dashboard."
- **Limited web results:** Some competitors are small or stealth. Note gaps honestly: "Limited public information available for [competitor]. Consider monitoring them more closely."
- **Conflicting data:** If CompetLab data and web research disagree (e.g., pricing page changed since last CompetLab scan), note both: "CompetLab data (from [date]) shows $49/mo. Their current pricing page shows $59/mo — appears to be a recent increase."

## What NOT To Do

- Don't speculate about private company metrics (revenue, burn rate) unless publicly reported
- Don't present opinion as fact — label interpretations clearly
- Don't skip the web research layer — CompetLab data alone isn't a dossier
- Don't write a 3,000-word essay when 1,500 words covers it — depth where it matters, brevity where it doesn't
- Don't forget: every SWOT item needs evidence, not vibes
