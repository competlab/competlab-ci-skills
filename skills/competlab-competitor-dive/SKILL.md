---
name: competlab-competitor-dive
description: |
  Builds a decision-ready dossier on ONE monitored competitor from every dimension CompetLab holds on them — AI Visibility, AI Sources, Positioning, Pricing Intelligence, Content Intelligence, Tech & Trust Profile — plus the Strategic Briefing's own researched read on that rival. Use when the user asks to "analyze [competitor]", "deep dive on [competitor]", "competitor dossier", "competitor profile", "research [competitor]", "what is [competitor] doing", "SWOT analysis for [competitor]", "competitor SWOT", or "tell me everything about [competitor]". NOT a card to read on a sales call (use competlab-battlecard), and NOT the whole market at once. Requires the CompetLab MCP server with an active project where this competitor is monitored.
argument-hint: <competitor-name-or-domain>
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_competitor mcp__competlab__get_briefing mcp__competlab__get_briefing_history mcp__competlab__get_briefing_edition mcp__competlab__get_positioning_dashboard mcp__competlab__get_positioning_history mcp__competlab__get_pricing_dashboard mcp__competlab__get_pricing_history mcp__competlab__get_content_dashboard mcp__competlab__get_content_changelog mcp__competlab__get_tech_trust_dashboard mcp__competlab__get_ai_visibility_dashboard mcp__competlab__get_ai_visibility_trend mcp__competlab__get_ai_sources_dashboard mcp__competlab__fetch_url WebSearch Read
metadata:
  author: competlab
  version: "3.2.1"
  website: https://competlab.com
  category: competitive-intelligence
---

# Competitor deep dive — one rival, every dimension

## The question this skill answers

**What has this competitor actually done, what did the platform measure, and what does it change for
us?**

One rival, all six dimensions filtered to them, plus the Strategic Briefing's researched read on that
same rival. The output is a dossier a founder, PMM or sales leader acts on — not a landscape, and not
something anyone reads mid-call.

## The platform already did the research

The briefing's `competitors` section carries a per-rival read, and its `deep-` sections cover funding,
hiring, product launches, reliability, customer voice and the developer ecosystem for every monitored
competitor — probed across more sources than a search returns, kept with history to difference
against, and shipped with their own stated limits.

**Read those sections. Do not re-derive them.** Searching the same ground gives a thinner answer from
fewer sources with nothing to compare it against. Web research here fills a gap the platform does not
cover, and it is the exception, not a step.

## Before you start

Read `references/reading-the-data.md`. Four of its rules carry most of a dossier: `null` is not zero,
counts never rates, per engine never pooled, and model prose is the model's. The fifth is dates —
every figure here came out of a run, and a dossier that does not say when it was measured is a
snapshot posing as a trend.

## Steps

**1. Resolve the competitor.**
`mcp__competlab__list_projects` → `mcp__competlab__list_competitors` to match the name or domain (the
customer's own row is marked `isOwn: true`) → `mcp__competlab__get_competitor` for the pages actually
monitored for this rival → `mcp__competlab__get_project` for when each dimension last ran.

A page nobody monitors is not a page that does not exist, and a dimension that has never run is not a
finding about the competitor. If the rival is not monitored at all, say so and offer to add them:
anything assembled without monitoring data is unverified web research and has to be labelled as that.

**2. Read the briefing's read on them.**
`mcp__competlab__get_briefing` with `sections: ["competitors"]` plus whichever `deep-` sections this
dossier needs — `deep-funding-capital`, `deep-hiring-gtm`, `deep-product-launches`,
`deep-reliability-status`, `deep-customer-voice`, `deep-ai-ecosystem`, `deep-agent-readiness`,
`deep-landscape`. The response's `contains` array says what the edition actually holds.

Check `meta.status` first. On `running` or `failed` the `item` is null **but an earlier edition is
usually still readable** — `mcp__competlab__get_briefing_history`, then
`mcp__competlab__get_briefing_edition`. A null `item` never means the project has no briefing.

**3. The four monitored surfaces, filtered to this rival.**

- **Positioning** — `mcp__competlab__get_positioning_dashboard` for the headline, value proposition,
  audience and differentiator as they wrote them; `mcp__competlab__get_positioning_history` for
  whether the message has moved, and when.
- **Pricing** — `mcp__competlab__get_pricing_dashboard`, then `mcp__competlab__get_pricing_history`
  for what changed. A measured `false` on a free plan is a finding. A `null` plan is a page we could
  not read, and says nothing about their pricing.
- **Content** — `mcp__competlab__get_content_dashboard` for volume, categories and gaps;
  `mcp__competlab__get_content_changelog` for the URLs added and removed since the previous run. What
  a competitor started publishing is often the earliest visible signal of what they are building.
- **Tech & trust** — `mcp__competlab__get_tech_trust_dashboard`. A measured `0` trust signals is a
  finding. A `null` is a scan that could not read the site. Two different sentences — never one that
  could be either.

**4. AI Visibility — membership first, never the score.**
`mcp__competlab__get_ai_visibility_dashboard`. Read `summary.promptMarket` before anything else:
unless its state is `rivals_named_in_most_answers`, say the prompts may not describe this project's
market, and do not lead with the map.

Then `summary.marketMap` — is this rival among the companies the models name in this category, and
where does the customer sit relative to them? Presence with its range and its count, ordered by
presence and by nothing else. **Two brands whose ranges overlap are tied.** Do not order them, and do
not turn the overlap into a story.

The cheap call worth knowing: `includeAnswers: true` with `brand=<their domain>` returns every answer
filtered to that one brand for roughly 2k tokens on a three-engine check, and about 9k once Google AI
Overviews is in the ask, against 25k–46k unfiltered. It is the cheapest way
to answer *where do they beat us, and where are they invisible*. An answer that comes back with an
empty brands list is an answer the model gave without naming them — a real finding, and a different
one from a question that produced no answer at all.

`mcp__competlab__get_ai_visibility_trend` returns **one row per company**: a reading now, a reading at
the start of the window, and whether the two are separable. **It is not a time series.** There is no
trajectory in it and no ninety days of movement to read off it. Where the intervals overlap, that is
two readings, not a movement.

**5. AI Sources — the pages behind those answers.**
`mcp__competlab__get_ai_sources_dashboard`. Perplexity and Google AI Overviews only: they are the two
engines that hand back the pages they retrieved. Per engine, never pooled. **Retrieved, never cited**
— the engines do not disclose which pages they leaned on.

In a rival's dossier the rows that matter in `summary.coreHosts` are the ones this competitor owns
(`ownership: "competitor_owned"`) — hosts more than one engine reads for this market that belong to
them and cannot be pitched. Count them, name them, and say plainly that they are not approachable. The
customer's own work list belongs to `competlab-ai-sources`, not to this dossier.

**6. Fill a gap, if one is left.**
`WebSearch` only for what no dimension and no briefing section covers. What it returns is a claim, not
a fact: verify it with `mcp__competlab__fetch_url` (`cleanHtml: true`) before it reaches the dossier,
and drop what does not verify rather than softening it into a hedge.

**7. SWOT, on evidence.**
Every item names the measurement behind it and the run or edition it came from. An item that cannot be
sourced that way does not go in — "strong brand" is not a finding, and neither is a number nobody can
trace. The evidence has one order of strength: what the platform measured — timestamped, and comparable
against the run before it — carries more than what a search returned, and a search result stays a claim
until the fetch in step 6 confirms it. Opportunities are what the customer can act on. Threats are tied
to something already observed, not to what a rival might conceivably do.

## Output

```markdown
# {Competitor} — dossier
*{Project}. Dimension runs: {dimension} {date}, … · Briefing edition {n}, {date}.*

## Where they sit
{3–5 sentences: who they are, what they are betting on, where they are exposed. The paragraph
someone reads before deciding anything.}

## Positioning · Pricing · Content · Tech & trust
{a short block each — what the run says, what changed since the one before it, what is unmeasured}

## AI Visibility
{Membership: is this rival among the companies the models name, and where is the customer relative to
them. Counts with their universe and their range. Ties marked as ties. Per engine.}

## AI Sources
{Per engine: which companies the answers named, and which core hosts this rival owns.}

## What the briefing already researched
{Funding, hiring, launches, reliability, customer voice, ecosystem — from the sections, naming the
edition. Not re-derived.}

## SWOT
{Strengths · Weaknesses · Opportunities for us · Threats from them — each item carrying its evidence.}

## What we did not measure
{Dimensions that have never run, scans that could not read the site, engines not asked, briefing
sections this edition does not contain.}

## Recommended response
{3–5 prioritised actions, each tied to something above.}
```

## What NOT to do

- Do not re-research funding, hiring, launches, reliability, customer voice or the developer ecosystem
  with a search. The briefing did it, across more sources, with history.
- Do not lead with the AI Visibility Score, a mention rate, a position or a citation count.
- Do not read a trajectory, a direction or a rate of change off the trend tool. It holds two readings.
- Do not order two brands whose ranges overlap, or call an overlapping difference a rise or a fall.
- Do not pool engines, and do not report a figure without the universe it came out of.
- Do not treat a `null` as a zero, or a page that could not be read as a page the brand is absent from.
- Do not present model prose as fact — "Claude described them as…", never "they are…".
- Do not put an unverified web claim into a dossier someone will quote.
- Do not speculate about private metrics — revenue, burn, churn — unless they were publicly reported.
- Do not write three thousand words where fifteen hundred covers it.

## Decision questions

End with 3–5 questions whose answers would change the recommendation, tied to what this dossier
actually found. State both branches where you can:

> "Their homepage moved toward enterprise buyers two runs ago and their pricing has not followed yet.
> If it does not, the opening is in the segment they are leaving. If it follows next quarter, that
> opening closes. Is this worth watching monthly, or acting on now?"
