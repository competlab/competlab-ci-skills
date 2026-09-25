---
name: competlab-battlecard
description: |
  Turns CompetLab monitoring data into a sales-ready battlecard against one competitor — at-a-glance comparison, why we win, where they are genuinely strong, objection handling, feature matrix, killer facts and landmines. Built for a rep scanning it in 60 seconds before a call, not for a reader who wants analysis. Use when the user asks to "create a battlecard", "sales battlecard for [competitor]", "competitive comparison card", "why us vs [competitor]", "win against [competitor]", "how to beat [competitor]", "objection handling for [competitor]", "sales cheat sheet", or "competitive one-pager". NOT for the full dossier behind it (use competlab-competitor-dive). Requires the CompetLab MCP server with an active project where this competitor is monitored.
argument-hint: <competitor-name-or-domain>
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_pricing_dashboard mcp__competlab__get_positioning_dashboard mcp__competlab__get_tech_trust_dashboard mcp__competlab__get_content_dashboard mcp__competlab__get_ai_visibility_dashboard mcp__competlab__get_ai_visibility_trend mcp__competlab__get_ai_sources_dashboard mcp__competlab__get_briefing mcp__competlab__fetch_url WebSearch Read
metadata:
  author: competlab
  version: "3.3.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# Battlecard — 60 seconds before the call

## Who this is for

A sales rep, on the way into a call. Not a CMO, not a report, not a dossier. The rep scans it in
sixty seconds and comes out knowing what to say, what they will hear, and what to ask.

That reader sets every rule below:

- **Scannable** — tables, bullets, short phrases. No paragraphs.
- **Spoken** — every line is something a human can say out loud. Marketing copy dies on a call.
- **Sourced** — each claim carries a proof point the rep can stand behind if the prospect pushes.
- **Honest** — where the competitor is genuinely strong is on the card, in its own section. A card
  that only flatters loses the deal the moment the prospect knows something the rep does not.
- **Dated** — every figure names the run it came from. A stale battlecard is worse than none.

## Before you start

Read `references/reading-the-data.md`. One rule matters more here than anywhere else in the suite:
**every figure carries its count.** A rep who says "12% mention rate" is quoting a number we do not
stand behind, and cannot answer *out of what?*. "Named in 8 of the 69 answers pooled across five
checks" is a number that survives the follow-up question. On a call, an unsourced figure is a
liability, not ammunition.

## Steps

**1. Resolve.** `mcp__competlab__list_projects` → `mcp__competlab__list_competitors` to match the name
or domain (the customer's own row is marked `isOwn: true`) → `mcp__competlab__get_project` for when
each dimension last ran. Those dates go on the card beside the figures they produced.

**2. Pull the four monitored surfaces.**
- `mcp__competlab__get_pricing_dashboard` — both sides' plans, billing and free tiers. A side-by-side
  price line is the most-used row on the card. A `null` plan is a page we could not read — never
  "they have no free plan".
- `mcp__competlab__get_positioning_dashboard` — what they claim on their homepage. This is what the
  prospect already saw.
- `mcp__competlab__get_tech_trust_dashboard` — stack, security headers, trust signals. A measured `0`
  is a finding a rep can use. A `null` is an unread scan and belongs nowhere near a call.
- `mcp__competlab__get_content_dashboard` — volume and categories, as a maturity signal, not a claim.

**3. AI Visibility — membership, not the score.**
`mcp__competlab__get_ai_visibility_dashboard`. Check `summary.promptMarket` first; unless its state is
`rivals_named_in_most_answers`, leave this section off the card entirely rather than putting a shaky
market read in a rep's mouth.

What belongs on a card is membership, in counts: which companies the AI models name in this category,
and whether the customer and this rival are among them. **Never the AI Visibility Score** — it is a
blended figure, it answers a question no prospect asked, and a rep cannot defend it. Order is by
presence, never by position, and **two brands whose ranges overlap are tied** — say tied, do not pick.

The dashboard's map is one page — the top rows plus the customer's own — so this rival may not be on
it. `mcp__competlab__get_ai_visibility_trend` carries every tracked competitor, and its `now` is the
latest map: take the rival's count from there. A rival at 0 of N was named in no answer; that is a
count the card can carry, never "not measured".

**4. AI Sources — where they are on the page and we are not.**
`mcp__competlab__get_ai_sources_dashboard`. If this rival is named on hosts that more than one engine
reads for this market and the customer is not, that is concrete, checkable, and lands on a call. Per
engine, never pooled — Perplexity and Google AI Overviews read different pages. **Retrieved, never
cited**: the engines do not say which pages they leaned on, so there is no citation count to quote.

**5. What real users say.** `mcp__competlab__get_briefing` with
`sections: ["competitors", "deep-customer-voice"]` — praise, complaints and switching stories the
platform already researched, with history behind them. Check `meta.status`: on `running` or `failed`
the `item` is null, which is not "no briefing" — build the card from the dimensions and move on.

**6. Verify the price before a rep quotes it.** `mcp__competlab__fetch_url` on their pricing page with
`cleanHtml: true`. If it disagrees with the last run, put both on the card with their dates and say
which is which. A rep quoting a price that changed last week loses the room.

**7. Gaps only.** `WebSearch` for an objection nothing above answers. Verify anything it returns with
the fetch above, and drop what does not verify — a rep will repeat this to a prospect.

**8. Build the card.** Read `references/battlecard-templates.md` for the format options.

## Output

```markdown
# Battlecard: {Our brand} vs {Competitor}
> Pricing run {date} · Positioning run {date} · Tech & trust run {date} · AI checks {date range}

## At a glance
| | {Our brand} | {Competitor} |
|---|---|---|
| **Pricing** | {plans and entry price} | {plans and entry price} |
| **Free tier / trial** | {measured value, or "not readable"} | |
| **Who they sell to** | {from positioning} | |
| **They claim** | {their headline, their words} | |
| **Trust signals found** | {n of the signals the scan checked} | |
| **Named by AI models** | {named in n of N answers} | {named in n of N answers} |

## Why we win
- **{Advantage}:** {the measurement behind it, with its count and date} → *Say: "{the line}"*

## Where they are strong — be ready
- **{Their real strength}:** {what the prospect will hear} → *Our answer: "{the line}"*

## Objections
### "Why not just use {Competitor}?"
### "{Competitor} is cheaper"
### "{Competitor} has more features"
### "{Competitor} is the bigger name"
> {2–3 spoken sentences under each}

## Feature comparison
| Feature | {Our brand} | {Competitor} | Edge |
{8–12 rows, decision-relevant only}

## Killer facts
- {One fact per line, each with its count, its universe and its date.}

## Landmines
- "{A question the rep asks the prospect that surfaces a gap we measured.}"
```

## Calibration

- **800–1000 words.** If the rep cannot find it in sixty seconds, restructure.
- **12 features maximum.** The ones that decide a deal, not every checkbox.
- **Objection answers are spoken language.** Read them aloud before they go on the card.
- **"Where they are strong" is mandatory.** A battlecard that says we win everywhere destroys the
  rep's credibility the first time a prospect knows better. Name two or three real strengths.
- **Dates on everything.** Pricing and messaging move between runs.

## What NOT to do

- **Never put a bare percentage on a card.** Counts with their universe: "named in 8 of 69 answers",
  not "12% of the time". The question set is small by design and a share off it is false precision.
- **Never quote the AI Visibility Score**, a position, an average placement or a citation count. Three
  of those do not exist and the fourth cannot be defended.
- **Never pool engines.** A combined figure describes a list none of them produced.
- **Never turn a `null` into a claim.** "They have no security headers" and "we could not read their
  site" are different sentences, and only one of them is safe to say to a prospect.
- **Never state model prose as fact.** "Claude described them as…", never "they are…".
- **Never let an unverified web claim onto the card.** The rep will say it out loud to a buyer.
- **Never write a card that only says we win.** It is the fastest way to lose the next call.

## Decision questions

3–5, tied to what this card actually showed, and aimed at the person who owns the sales motion:

> "Their entry price is below ours on every plan and the trust-signal gap runs the other way. That
> makes this a value conversation, not a price one — which means the rep needs the security proof in
> the first ten minutes. Is that how the current deck is ordered?"
