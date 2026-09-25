---
name: competlab-monitoring-setup
description: |
  Reviews how a CompetLab project is configured and recommends what to change — whether the right competitors are on the roster, whether the AI Visibility prompts describe the market the customer actually competes in, and what the schedules are running per dimension. Proposes roster changes as swaps with the evidence on both sides, because a project monitors a limited number of competitors. Use when the user asks "am I tracking the right competitors", "should I add X to monitoring", "are my prompts right", "review my monitoring setup", "how often does this run", "what is my schedule", or "who should I drop". NOT for reading what the monitoring found (use the per-dimension skills). Recommends only — it changes nothing. Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__list_schedules mcp__competlab__get_ai_visibility_dashboard mcp__competlab__get_ai_visibility_trend mcp__competlab__get_briefing Read
metadata:
  author: competlab
  version: "3.3.1"
  website: https://competlab.com
  category: competitive-intelligence
---

# Monitoring setup — the roster, the questions, the cadence

## The question this skill answers

**Am I monitoring the right competitors, asking the right questions, and running at the right
cadence?**

Three separate answers, and they are not equally important. If the prompts do not describe this
market, every other reading the platform produces is measuring something else — so that check comes
first and outranks the rest of this skill.

## This skill recommends. It does not change anything.

There are no write tools here. The roster, the prompts and the schedules are all edited in the app by
a person. Everything below produces a recommendation with its evidence attached, for someone else to
act on.

## Before you start

Read `references/reading-the-data.md` — §11 for the briefing's status field, §12 for why a project with no
alerts is the expected state and not a misconfiguration.

## Steps

**1. Read the current configuration.**
`list_projects` → `get_project` for the prompts and per-dimension freshness → `list_competitors` for
the roster (the customer's own row carries `isOwn: true`) → `list_schedules` for enabled, interval,
and last and next run per dimension.

**2. Check the prompts before anything else.**
`get_ai_visibility_dashboard` → `summary.promptMarket`. **Unless its state is
`rivals_named_in_most_answers`, that is the finding**, and it belongs at the top of the report: the
prompts may not describe this project's market, and every reading built on them inherits the problem.
Questions that return industry registries rather than vendors look like a working check and measure
the wrong universe.

AI Visibility asks the project's **3 prompts**. AI Sources asks **8 fixed buying questions** that are
not user-editable — so prompt quality is an AI Visibility question only, and never propose editing the
AI Sources set.

> **Editing a prompt's text resets that prompt's market history. Saving it unchanged does not.**
> Never suggest a casual reword. A wording change starts that prompt's trend over from the next check,
> so propose one only when the prompt is measuring the wrong market, and state the cost in the same
> sentence as the suggestion.

**3. The promotion decision — read it, do not re-derive it.**
`get_briefing` with `sections: ["hub","competitors"]`. The Strategic Briefing already identifies
unmonitored brands worth adding and states its reasoning; the hub names them and the competitors
section carries the case. Check `meta.status` first — on `running` or `failed`, `item` is null but an
earlier edition is usually still readable.

Then `item.untrackedCoreBrands` on the AI Visibility dashboard: the platform already computes, from the
whole market map, which brands are core to this market and not on the roster, each with its presence
and range. It is a recommendation to track them, never a fact about them, and an absent list means
withheld, not none. A brand the models name repeatedly and the project does not watch is the
strongest promotion candidate there is.

For how often each monitored competitor is named, read `get_ai_visibility_trend`: it carries every
tracked competitor, one named in no answer included (0 of N), while the dashboard's market map is one
page and may not reach them all.

**4. Frame every roster change as a swap.**
A project monitors a limited number of competitors, so **adding one means dropping one.** Never write
an open-ended "also consider adding these" — that is a list the customer cannot act on without
deciding the hard half themselves. Each proposal names the brand in, the brand out, and the evidence
on both sides. If nothing is weak enough to drop, say that, and say the roster is full.

**5. Cadence — report what the API returns.**
Give the interval, the last run and the next run per dimension exactly as `list_schedules` reports
them. Per-dimension minimums exist and cadence is deliberately in flux while the product is young.
**Read every interval from the API and never quote one from memory** — a number that was right last
month is a wrong recommendation this month.

## Output

```markdown
# Monitoring setup — {Project}
*Configuration as of {date}.*

## Do the prompts describe this market?
{`promptMarket` state, in words, and what follows from it. If it is not `rivals_named_in_most_answers`
this is the whole headline.}

## Roster — {n} monitored
| Competitor | Monitored since | Named in AI answers | Notes |
|---|---|---|---|

## Proposed swaps
| Add | Drop | Why add | Why drop |
|---|---|---|---|
{One row per swap, or "the roster is full and nothing is weak enough to drop".}

## Schedules
| Dimension | Enabled | Interval | Last run | Next run |
|---|---|---|---|---|
{Exactly as returned.}

## What we did not check
{Dimensions with no run yet, a briefing that was still running, anything the roster cannot show.}
```

## What NOT to do

- Do not change anything. This skill has no write tools, and the configuration is a person's call.
- Do not suggest rewording an AI Visibility prompt casually — the reword costs that prompt's history.
- Do not propose editing the AI Sources buying questions. They are fixed.
- Do not write an interval or a minimum into the report from memory. Read both from the API, and date
  what you report.
- Do not propose an addition without naming the drop that pays for it.
- Do not re-research the promotion candidates. The briefing has already done it against more sources
  and keeps history to difference against.
- Do not read zero alerts as a misconfiguration. Alerts are off by default and that is the expected
  state.
- Do not lead with an AI Visibility score, here or anywhere.

## Decision questions

End with 3–5 questions whose answers would change the configuration, tied to what this project's data
actually showed:

> "The prompts return registries rather than vendors, so the market map is measuring a different
> universe than the one you sell into. Rewriting them fixes the measurement and costs the trend you
> have built so far. Is the trend worth more than the next six months being right?"
