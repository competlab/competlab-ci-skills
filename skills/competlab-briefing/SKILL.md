---
name: competlab-briefing
description: |
  Reads a CompetLab project's Strategic Briefing — the platform's own synthesis across 14 analysis areas — at whatever depth the question needs: a short pulse, a full competitive landscape, or a specific dimension's deep dive. Also compares editions to answer what changed since last time. Use when the user asks for a "briefing", "CMO report", "strategic briefing", "competitive update", "what changed with competitors", "catch me up", "competitive landscape", "quarterly review", "full competitive analysis", or "board-level CI". NOT for a single competitor (use competlab-competitor-dive) or a sales card (use competlab-battlecard). Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_briefing mcp__competlab__get_briefing_history mcp__competlab__get_briefing_edition mcp__competlab__list_alerts Read
metadata:
  author: competlab
  version: "3.0.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# Strategic Briefing

## What this is

CompetLab generates the analysis itself. The Strategic Briefing is a numbered, persistent edition
covering **14 analysis areas** — the 6 monitored dimensions, plus 8 it researches for the briefing
alone: landscape, funding and capital, hiring and GTM, product launches, reliability and status,
agent readiness, AI ecosystem, and customer voice.

**Your job is to read it at the right depth and say what matters. Not to rebuild it.**

Those eight researched areas are probed more deeply than an agent can manage in a session, and they
carry history to difference against. Re-deriving them with web search produces a thinner answer that
may contradict the customer's own dashboard. Read the section.

## Before you start

Read `references/reading-the-data.md` — §11 in particular, which covers how to read `meta.status`.
Getting that wrong is how an agent tells someone they have no briefing when they have three.

## Step 1 — resolve the project

`list_projects` for the `projectId`. If the user named a project, match it; if there is exactly one,
use it; otherwise ask which.

`get_project` gives the per-dimension freshness, which tells you whether any dimension has run since
the briefing was written — worth knowing before you report the briefing as current. `list_competitors`
gives the roster when you need to know who is monitored (the customer's own domain is in it, marked
`isOwn: true`).

## Step 2 — get the briefing, and check its state first

`get_briefing` returns the **latest run in whatever state it is in.** Check `meta.status` before
anything else:

| `meta.status` | what to do |
|---|---|
| `done` | the briefing is in `item`. Proceed. |
| `running` | being generated now; `meta.progress` gives the step. A run takes about two hours — do not call it late or failed for taking that long. Read the previous edition instead (below). |
| `failed` | the last attempt produced no edition. Surface it — it does not resume on its own. Read the previous edition. |
| `null` | this project has never had a briefing. Only this means genuinely nothing. |

**On `running` or `failed`, `item` is null but an earlier edition is almost always readable.** Call
`get_briefing_history`, take the most recent `done` edition, and read it with `get_briefing_edition`.
Say which edition and date you are reading from.

> Never report "no briefing is available" on the strength of a null `item`. Check the history.

## Step 3 — pick the depth from the question

Default is `sections: ["hub"]` — the executive digest. It is cheap, it orients you, and it answers
most questions on its own. Its per-dimension verdicts name which deeper section to open next, so let
it route you rather than guessing.

| The user wants | Sections |
|---|---|
| a pulse, "what changed", "catch me up" | `["hub"]` |
| what to do about it | `["hub","actions"]` |
| the full landscape / a board review | `["hub","actions","competitors"]` + the 2–3 `deep-*` the hub flags |
| one dimension in depth | `["deep-<area>"]` |
| everything, for export | `["all"]` — large; only when they asked for the whole thing |

The 14 deep sections: `deep-ai-visibility`, `deep-ai-sources`, `deep-positioning`, `deep-pricing`,
`deep-content`, `deep-tech-trust`, `deep-agent-readiness`, `deep-ai-ecosystem`, `deep-customer-voice`,
`deep-funding-capital`, `deep-hiring-gtm`, `deep-landscape`, `deep-product-launches`,
`deep-reliability-status`.

**Read the response's `contains` array** to see what that edition actually holds, rather than assuming
a section exists.

Charts return titles and notes only unless you pass `includeCharts: true`. **Never answer a question
about a figure or a trend from a chart you fetched without the numbers.**

## Step 4 — what changed since last time

This is the question the briefing answers best and the one most often asked badly.

The `whatChanged` block on the hub already carries the delta against the previous edition, with
`deltas` counts and dated events. Use it. Only reach for `get_briefing_history` +
`get_briefing_edition` when the user wants a comparison the current edition does not already make —
two specific editions, or a longer arc.

For anything fresher than the briefing's own date, `list_alerts` covers what has fired since. Note
that **alerts are off by default**, so an empty result is the expected state and not a defect.

## Step 5 — say what matters

Lead with the single line that changes what the reader does. The hub's `headline` block is usually
that line already — if you disagree with it, say so and say why, but do not quietly replace it.

Then: what changed, what it means, what to do. Keep the reader's time budget in mind — a pulse is a
few hundred words, not a report.

**The `coverage` block is not optional.** It lists what could not be measured this run, and it is what
stops a reader treating a gap as a finding. Carry the parts that bear on what you reported.

## Output shape

For a pulse — short, under 400 words:

```markdown
# {Project} — {date}
**{The one line that changes what you do.}**

## What changed
{3–5 dated items, each with what it means. Not a list of numbers.}

## Worth doing
{1–3 actions, sized. Cheapest first where they are equivalent.}

## Not measured this run
{From coverage — only what bears on the above.}
```

For a landscape or full read, follow the briefing's own structure — hub headline, the standings, the
per-dimension verdicts, the named threat, then the deep sections requested. Do not invent a different
skeleton; the edition is already organised for a reader.

## What NOT to do

- **Do not re-research the eight briefing-only areas.** If the user asks about competitor funding,
  hiring, launches, reliability, reviews or developer ecosystem, the answer is `deep-funding-capital`,
  `deep-hiring-gtm`, `deep-product-launches`, `deep-reliability-status`, `deep-customer-voice`,
  `deep-ai-ecosystem`. Read it.
- **Do not fetch `["all"]` by reflex.** It is large, and the hub answers most questions.
- Do not report "no briefing" without checking `get_briefing_history`.
- Do not describe a two-hour run as slow or stuck.
- Do not quote a chart's figures without `includeCharts: true`.
- Do not turn overlapping ranges into a movement, or a count into a percentage. The briefing is
  careful about this; do not undo it downstream.
- Do not drop the coverage caveats because they complicate the story.

## Decision questions

Close with 3–5 questions whose answers would change the recommendation, drawn from what this edition
actually surfaced. Where the briefing offers a fork, put the fork to the reader rather than choosing
silently for them.
