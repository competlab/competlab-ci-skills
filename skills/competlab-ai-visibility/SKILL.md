---
name: competlab-ai-visibility
description: |
  Answers one question: which companies do AI models recommend in this category, and is the customer one of them? Reads CompetLab's AI Visibility market map across ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews. Use when the user asks "who do AI models recommend in my space", "are we in the core", "AI visibility report", "what does ChatGPT say about us", "do LLMs recommend us", "AI brand check", "GEO analysis", or "market map". NOT for traditional SEO or Google rankings, and NOT for which pages the models read to decide (use competlab-ai-sources). Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_ai_visibility_dashboard mcp__competlab__get_ai_visibility_trend mcp__competlab__get_ai_visibility_history mcp__competlab__get_ai_visibility_check_detail Read
metadata:
  author: competlab
  version: "3.0.2"
  website: https://competlab.com
  category: competitive-intelligence
---

# AI Visibility — core or tail

## The question this dimension answers

**Who is recommended by AI in this category, and is the customer one of them?**

There is a **core** of companies that AI answers name, and a **tail**. The core is stable — it changes
seldom, and a limited number of questions is enough to detect it. Asking more only confirms it.

The customer cares about one thing: **are they in the core.** In the tail, they can fight. In neither,
that is different work.

Everything else this dimension produces — presence, ranges, per-engine splits, endorsement, the
blended score — is **the mechanism that decides membership, not the answer.**

## Before you start

Read `references/reading-the-data.md`. It is not optional here: this dimension has more ways to be
read wrong than any other in the platform, and the two worst are leading with a score and ordering two
brands whose ranges overlap.

## Steps

**1. Resolve the project.**
`list_projects` → `get_project` for the prompts and per-dimension freshness → `list_competitors` for
the roster (the customer's own domain is in it, marked `isOwn: true`).

**2. Read the market map.**
`get_ai_visibility_dashboard`. Go to `summary.marketMap`.

**3. Check `summary.promptMarket` before you use the map.**

Unless its state is `rivals_named_in_most_answers`, **say the prompts may not describe this project's
market, and do not lead with the map.** A map built from questions that return registries rather than
vendors is measuring the wrong thing, and reporting it as the market is the worst error available
here. This check comes first, every time.

**4. State membership.**

> "Nine companies make up this market as the AI models draw it. The customer is one of them, tied for
> 7th of 9 by how often it is named."

or

> "Eight companies make up this market. The customer is not one of them — named in 1 of the 15 answers
> this check, against the leader's 14."

Find the customer's row by `isOwn: true`. Use `marketMap.coreSize`, `rankByPresence`, and the presence
figure **with its range and its count**.

While `marketMap.tailIsProvable` is false, say **no brand can be ruled out of this market yet.**

**5. Read the per-engine split before calling anything core.**
A brand core to one model and a brand core to all five look identical on the pooled figure. Read
`perEngine`. A brand named everywhere is a different finding from a brand one model likes.

**6. Only now, the supporting reading.**
- `get_ai_visibility_trend` — one row per company, a reading now and at the window's start, and
  whether they are separable. A digest, not a plot; `detail: "series"` adds up to 12 points per
  company if you genuinely need them. Either way, if the ranges overlap that is two readings, not a
  movement.
- `get_ai_visibility_history` → `get_ai_visibility_check_detail` for a specific past check.
- `includeAnswers: true` with `brand=`, `provider=` or `promptIndex=` when you need what was actually
  said. Unfiltered is 25k–46k tokens; `brand=` is about 2k.

## Reporting rules specific to this dimension

**Never lead with the AI Visibility Score.** It is a blended figure and it answers a question nobody
asked. A brand named once can read 2; a brand named often and placed low can read 1. If you mention it
at all, mention it after membership, and say what it is: a 0–100 figure over the top five positions
only.

**Never report a position or an average position.** The field does not exist, by design. Order is by
presence — how often a brand is named — and nothing else.

**Never order two brands whose ranges overlap.** They are tied. Say so.

**Check the sign on `mentionRateGap`** — it is the customer minus the leader, so negative means
behind. Reporting a trailing brand as leading is the most damaging mistake on this dimension.

**Google AI Overviews names companies and ranks nothing.** Any order you see there is CompetLab's
order of first mention. Its rows carry no description, which is why `marketMap.profileEngines` lists
four engines, not five.

**An engine absent from a check was not asked.** Older checks ran three or four engines. That is not a
brand's absence from that engine.

**Model prose is the model's.** "Claude described them as…", never "they are…".

## Output

Short. The answer is a membership statement, not a dashboard.

```markdown
# AI Visibility — {Project}
*{n} answers on the {date} check; {N} pooled across {k} checks in the current window.*

## Core or tail
{One sentence: how many companies make up this market, and where the customer sits.}

## The market as the models draw it
| Company | Named in | Presence | Monitored |
|---|---|---|---|
{rows — presence with its range; ties marked as ties}

## Per engine
{Which engines name the customer and which never have. Name the ones that produced nothing.}

## What this means
{2–4 sentences. Membership first. What would have to change for it to move.}

## What we did not measure
{Engines not asked, checks that came back short, prompt-market caveat if it fired.}
```

## What NOT to do

- Do not lead with a score, a mention rate, a position, or a citation count.
- Do not compute a percentage from a small answer set without its count and range beside it.
- Do not call a difference a rise or a fall when the intervals overlap.
- Do not pool engines, and do not draw them as slices of one whole.
- Do not report Google AI Overviews' order as a ranking Google gave.
- Do not present model prose as fact.
- Do not tell the user what to do about the sources behind the answers — that is
  `competlab-ai-sources`, and it has its own limits.

## Decision questions

End with 3–5 questions whose answers would change the recommendation. Tie them to what the data
actually showed — not generic clarifications. State both branches where you can:

> "If the goal is entering the core, the work is off-property and slow. If it is defending a tail
> position against a specific rival, it is narrower and faster. Which is it?"
