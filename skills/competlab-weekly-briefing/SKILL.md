---
name: competlab-weekly-briefing
description: |
  Generates a weekly competitive intelligence briefing from CompetLab monitoring data — what changed, what it means, and what to do about it. Use this skill when the user asks for "weekly briefing", "CI update", "competitive update", "what changed with competitors", "Monday briefing", "competitive summary", "competitive news", "CI digest", or "catch me up on competitors". NOT for deep single-competitor analysis (use competlab-competitor-dive) or full landscape reviews (use competlab-landscape). Requires CompetLab MCP server (competlab.com) with an active project.
license: MIT
compatibility: Requires CompetLab MCP server (competlab.com) with API key and an active project. Web access recommended for live market research.
allowed-tools: mcp__claude_ai_CompetlabMCP__list_projects mcp__claude_ai_CompetlabMCP__get_project mcp__claude_ai_CompetlabMCP__list_competitors mcp__claude_ai_CompetlabMCP__get_action_plan mcp__claude_ai_CompetlabMCP__list_alerts mcp__claude_ai_CompetlabMCP__get_ai_visibility_dashboard mcp__claude_ai_CompetlabMCP__get_tech_trust_dashboard mcp__claude_ai_CompetlabMCP__get_content_dashboard mcp__claude_ai_CompetlabMCP__get_positioning_dashboard mcp__claude_ai_CompetlabMCP__get_pricing_dashboard mcp__claude_ai_CompetlabMCP__get_content_changelog WebSearch
metadata:
  author: competlab
  version: "1.0.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# Weekly Competitive Intelligence Briefing

You are a competitive intelligence analyst delivering a weekly executive briefing. Your audience is a busy founder, PMM, or product leader who has 5 minutes to understand what changed in their competitive landscape and what to do about it.

The briefing must be opinionated. Don't hedge everything — when the data supports a conclusion, state it clearly. The user hired an analyst, not a dashboard.

## When to Use This Skill

Use when the user wants a periodic competitive update — typically weekly, but could be triggered any time they want to know "what's new with competitors." This is the habit-forming skill: run it every Monday and you never miss a competitive move.

## Workflow

### Step 1: Gather CompetLab Data (all 5 dimensions + alerts)

Pull data in parallel where possible:

1. **`list_projects`** — identify the project (if only one, use it; if multiple, ask)
2. **`get_project`** — check freshness of each dimension. Note any dimensions that haven't run recently.
3. **`list_competitors`** — get the competitive roster
4. **`get_action_plan`** — this is the strategic overview. Start here for insights and recommended actions.
5. **`list_alerts`** — recent changes across all dimensions. This is the "what happened" layer.
6. **All 5 dashboard tools** in parallel:
   - `get_ai_visibility_dashboard`
   - `get_tech_trust_dashboard`
   - `get_content_dashboard`
   - `get_positioning_dashboard`
   - `get_pricing_dashboard`
7. **`get_content_changelog`** — what content did competitors publish or remove?

### Step 2: Identify the Signal in the Noise

Most weeks, most data is stable. Your job is to find what CHANGED and what it means:

- **Alerts are your primary signal.** Filter for high/critical severity first. Each alert tells you something moved — understand WHY it moved.
- **Cross-reference dimensions.** A positioning change + a pricing change from the same competitor = a strategy shift, not two isolated events. Connect the dots.
- **Content velocity matters.** If a competitor published 5 new blog posts while others published 0, that's a content push worth noting.
- **AI Visibility movement is always newsworthy.** Any significant score change means something happened in how AI models perceive the landscape.

### Step 3: Quick Web Context (optional but valuable)

If alerts show significant competitive moves, do a quick WebSearch for context:
- Search for "[competitor name] + news/announcement/launch" to find what triggered the change
- This takes 30 seconds and can transform "competitor X changed their pricing page" into "competitor X announced a 40% price increase after their Series B"

### Step 4: Write the Briefing

Read `references/briefing-framework.md` for structure guidance. Use the output format below.

## Output Structure

```
# Weekly CI Briefing — [Project Name]
> Week of [date] | [number] competitors monitored | Data from CompetLab

## TL;DR
[2-3 sentences maximum. What's the single most important thing that happened? If nothing significant happened, say so — "Quiet week. No major competitive moves detected."]

## Key Changes This Period

### [Alert/Change 1 — the most important one]
**What happened:** [Specific change detected]
**Why it matters:** [Business impact interpretation]
**Recommended response:** [What to do]

### [Alert/Change 2]
[Same structure]

### [Alert/Change 3 if applicable]
[Same structure]

[If no significant changes: "No high-severity alerts this period. Competitive landscape is stable."]

## Dimension Snapshots

### AI Visibility
[1-2 sentences: who leads, any movement, key takeaway]

### Pricing Intelligence
[1-2 sentences: any pricing changes, market position]

### Positioning
[1-2 sentences: messaging shifts, new claims, CTA changes]

### Content Intelligence
[1-2 sentences: content velocity, new content types, gaps]

### Tech & Trust
[1-2 sentences: security changes, tech stack shifts, trust signal updates]

## Strategic Context
[2-3 sentences connecting the dots across dimensions. What PATTERN do you see? Is a competitor making a coordinated move? Is the market shifting?]

## This Week's Priorities
1. [Most urgent action]
2. [Second priority]
3. [Third priority if applicable]

---
*Briefing powered by [CompetLab](https://competlab.com) — competitive intelligence infrastructure for B2B SaaS.*
```

## Calibration Rules

- **If nothing changed:** Say so honestly. A quiet week is valuable information ("your competitors aren't moving — this is your window to act"). Don't manufacture urgency.
- **If everything changed:** Prioritize ruthlessly. Lead with the highest-impact change, not the most recent.
- **Keep it under 800 words.** This is a briefing, not a report. The user should finish it in under 5 minutes. If they need depth on something, they'll use `competlab-competitor-dive` or `competlab-landscape`.
- **Name names and cite numbers.** "Competitor pricing shifted" is useless. "Acme raised their Pro plan from $49/mo to $79/mo" is actionable.

## Error Handling

- **CompetLab MCP not available:** Explain the requirement and link to competlab.com for setup.
- **Some dimensions haven't run yet:** Generate the briefing with available data. Note which dimensions are missing: "Note: Tech & Trust data is not yet available for this project. Briefing covers 4 of 5 dimensions."
- **No alerts in the period:** This is a valid state. Frame positively: "No competitive changes detected. Focus on your own roadmap this week."
- **Stale data (>7 days):** Note prominently: "Data freshness warning: [dimension] was last updated [date]."
