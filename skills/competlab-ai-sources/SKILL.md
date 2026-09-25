---
name: competlab-ai-sources
description: |
  Reads CompetLab's AI Sources dimension — which pages Perplexity and Google AI Overviews actually retrieved while answering a category's buying questions, which companies those answers named, and which of those pages name the customer's competitors and not the customer. Produces the work list of approachable hosts. Use when the user asks "why are they recommended and not us", "what does AI read about my market", "which pages decide the AI answers", "where do I need to appear", "AI sources report", or "who is on the pages the engines read". NOT for whether AI recommends you at all (use competlab-ai-visibility). Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors mcp__competlab__get_ai_sources_dashboard mcp__competlab__get_ai_sources_history mcp__competlab__get_ai_sources_check_detail Read
metadata:
  author: competlab
  version: "3.3.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# AI Sources — what the engines read before they answer

## The question this dimension answers

AI Visibility answers *who is recommended*. The customer's next question is **why them and not me**,
and this is the dimension that opens that up.

It asks the project's **8 buying questions** on the two engines that hand back the pages they
retrieved — **Perplexity and Google AI Overviews** — reads those pages, and reports, per engine, which
companies the answer named, which pages the engine pulled, and which of those pages name competitors
and not the customer.

## What it is not

**It shows what the models read. It does not tell a customer what to do to be recommended.** Say so.
Two limits travel with every claim this skill makes, and they are not hedges — they are findings:

- **Training data often outweighs what the models read.** The models say so directly when asked: they
  recommend companies they already know to be large, long-established and widely written about,
  whatever today's retrieval turned up.
- **A source can be read by every engine, every time, and belong to a company none of them
  recommend.** Being in the evidence layer is not being in the recommendation layer. When the data
  shows this — an engine opening the customer's own pages and then naming only other companies — that
  *is* the finding, and it is a sharper one than any work list.

And the reason there is no universal checklist to hand over: **the factors differ by category.**
Uptime-monitoring leaders are weighed on distributed server networks, pricing and reliability;
database tools on certifications and an entirely different set. Every competing tool publishes one
unified list of what to do. There isn't one.

## Before you start

Read `references/reading-the-data.md`. This dimension has the strictest reporting rules in the
platform and they are easy to break by accident — §2 (counts never rates), §3 (per engine never
pooled), §7 (retrieved never cited) and §8 (condition codes are payload) all apply on every sentence.

## Steps

**1. Resolve the project.** `list_projects` → `list_competitors`.

**2. `get_ai_sources_dashboard`.** Everything is under `summary`, and it arrives compact:
`summary.brands` and `summary.pages` are one page each — `summary.brandsPage.total` is how many
companies the engines named, never the rows on the page — while `summary.coreHosts` is whole, each host
with its `pageUrls`; `pagesHost: "<host>"` returns that host's page rows. The response opens with
`readingGuide`, the rule for each field in it. Do not pass `includeAnswers` on the first call — the
page lists are very large. When you need what was actually said, read one check with
`get_ai_sources_check_detail` (`get_ai_sources_history` with `limit: 1` gives the latest check's id),
`includeAnswers: true` and `promptIndex=`: `engine=` alone barely narrows it
(`references/platform.md` § Answer sizes).

**3. State the condition, beside the counts it rests on.**

`summary.verdict` is a condition code decided when the summary was built. It is not a rating and you
never re-derive it:

| `verdict` | means |
|---|---|
| `recommended_nowhere` | no answer in the window named the customer |
| `named_on_most_core_hosts` | named on at least half the core hosts — a short work list, not an empty result |
| `missing_from_most_core_hosts` | named somewhere, absent from most hosts more than one engine read |

> "*Recommended nowhere* — 0 of 31 answers named them, on the same checks where an engine opened
> their own site 18 times."

**4. Report per engine.** Never pool. For each engine, quote the pairs from `summary.perEngine`:
`answersNamingCustomer` of `answersReceived`; `independentPagesNamingCustomer` over `pagesRead`. If a
page count arrives as `{floor, ceiling}`, quote both numbers.

An engine missing from the record was not asked. An engine carrying `engineDataAvailable` produced
nothing usable. Neither is a zero, and neither is a fact about the customer.

**5. Build the work list.** This is the deliverable.

From `summary.coreHosts`, take every row with `status: "missing"` — hosts two or more engines read for
this market that do not name the customer. Then split on **`ownership`**, which has exactly two values:

- `ownership: "third_party"` → **approachable. This is the work list.** It includes a site that
  belongs to a company the engines named but the project does not track — its pages carry `ownedBy`.
- `ownership: "competitor_owned"` → **not a target:** the site of a competitor the project tracks.
  You cannot pitch your way onto a rival's own site. Count them, name them, and set them aside.

`summary.funnel` has already done this split — `missingPublishers` is the approachable count and
`missingCompetitorOwned` the rest. Quote those rather than recounting, so your number and the
platform's cannot disagree.

**`kind` is a different field and is not a filter.** It says what sort of site a host is —
`publisher`, `community`, `review_site`, `video` — and it shapes *how* you approach a row, not
*whether* you can. A review site is approachable; its `actionHint` will say to claim the profile.

The other two statuses:

- `status: "unreadable"` → we could not read it. **Never a page the customer is absent from.** List it
  separately.
- `status: "already_named"` → won.

**Render each row's `actionHint.text` verbatim.** It is written for the reader. Do not paraphrase it
into your own advice.

**6. Check `ownPageRetrievals`.** Where an engine opened the customer's own page and the answer named
only other companies, say it plainly and say how often. It is usually the most useful sentence in the
report, and it is the one the customer will not have guessed.

**7. Carry `summary.limits.sentences` through.** They are the standing caveats for these numbers. If
you quote the figures, you carry the sentences.

**8. Only if the user asks what changed.** `get_ai_sources_history` lists published checks;
`get_ai_sources_check_detail` reads one of them. Compare like with like — the core widens and narrows
as engines read different pages, so a host count that grew may mean the tracked core grew rather than
that the customer fell off anything. Say which.

## Output

```markdown
# AI Sources — {Project}
*{n} answers across {engines} over {k} checks since {date}.*

## Where this stands
{The verdict in words, with the counts it rests on.}

## Per engine
| | Perplexity | Google AI Overviews |
|---|---|---|
| Answers received | {n} of {N} asked | |
| Answers naming the customer | | |
| Pages read | | |
| Pages naming the customer, independent | | |

## The work list — {n} approachable hosts
| Host | Read by | What the check says to do |
|---|---|---|
{publisher/community rows with actionHint.text verbatim}

{n} further core hosts are tracked competitors' own sites and are not targets: {list}.
{n} could not be read and are not counted against the customer: {list}.

## What the engines read of the customer's own site
{ownPageRetrievals — how often, and what the answers named instead.}

## Limits
{limits.sentences, verbatim.}
{The two standing limits: training data; evidence layer is not the recommendation layer.}
```

## What NOT to do

- **Never say "cited".** The engines do not disclose which retrieved pages they leaned on. A citation
  count is a number that does not exist.
- **Never pool pages across engines.** `summary.limits.pagesRetrieved` is a fetch-stage inventory, not
  "the pages the engines read", and `summary.pagesPage.total` is a paging figure, never a page count.
- **Never report a percentage or a share.** Eight questions per engine is too small a set for a rate
  to mean anything. Counts, with their universe.
- **Never say an answer came "from memory."** An answered slot with `pagesRetrieved: 0` reported no
  page; the engine has not said how it answered.
- **Never treat an unreadable page as an absence.**
- **Never count a page on the customer's own domain as an independent source naming them.**
- **Never hand over a generic GEO checklist.** If the data does not support a recommendation, the
  finding is what the data shows, not a list of best practices.
- Do not promise that working the list produces recommendations. It changes what the engines read. It
  does not control what they recommend.

## Decision questions

3–5, tied to what this check actually showed. Conditional framing where the branch matters:

> "Nine of the seventeen hosts are approachable and the other eight are rivals' own sites. Working the
> nine is a cycle of outreach with a readable result next check. Is there someone to own that, or does
> this need to wait for a cycle where there is?"
