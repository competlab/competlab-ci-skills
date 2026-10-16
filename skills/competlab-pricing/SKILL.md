---
name: competlab-pricing
description: |
  Reads CompetLab's Pricing Intelligence dimension — what every tracked company charges as a visitor from the US sees it on its own pricing page, what two or three typical buyer setups cost at each company cheapest first and where the customer stands, what each plan includes, the prices found elsewhere in a quote-only market, every confirmed change written from X to Y with its two dates and its level, the lines the market writes about the customer, and the companies that closed, were renamed or bought. Use when the user asks "what do my competitors charge", "did anyone change their prices", "where do I sit on price", "who is cheapest for a team like mine", "what does their free plan include", "what changed on their pricing page", "is anyone undercutting us", or "pricing report". NOT for a card to read on a sales call (use competlab-battlecard) and NOT for one rival across every dimension (use competlab-competitor-dive). Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_pricing_dashboard mcp__competlab__get_pricing_history mcp__competlab__get_pricing_run_detail mcp__competlab__list_alerts Read
metadata:
  author: competlab
  version: "3.4.0"
  website: https://competlab.com
  category: competitive-intelligence
---

# Pricing Intelligence — what the market charges, read from the pages

## The question this dimension answers

**What does each company in this market charge today, as a buyer in the US sees it on their pricing
page; what would a typical buyer pay at each of them; where does the customer stand; and what changed
since the last check?**

A check reads every tracked company's pricing page — the customer's own included — as a visitor from
the US, writes down what each page says in the page's own words, compares the read with the previous
one, and raises a change only when a second read confirms it. A value switching back and forth is a
test, not a change. A price shown in another currency or period with the same amount is not a change.

Everything it reports is something the user could go and read on the rival's page today. The one
thing it adds is the comparison: the same two or three buyer setups priced at every company, cheapest
first, so the order means the same thing every check.

## What it is not

It alerts to changes, with the facts around them. **Strategy, advice and tickets are the Strategic
Briefing's.** Nothing on this surface scores, averages or flags a gap: there is no average across
companies, no price position, no tier count, no "consider raising your price". A report built on this dimension
states the prices, the setups, the changes and the dates, and stops.

## The three levels, in the customer's words

Every change the check confirms carries a `level`. Use the customer's words for it, never the token:

| `level` | Say | What it covers |
|---|---|---|
| `now` | **Tell me now** | A rival goes free or undercuts the customer's price; publishes an offer aimed at the customer's customers; closes or is bought. |
| `this_week` | **Tell me this week** | Any other change at a rival: a price up or down, a plan's limits or included users, a free plan that grows or shrinks, a trial or a promotion that starts or ends, prices shown or hidden. |
| `record` | **Keep a record** | Small things: a page read for the first time, a company renamed, a change on the customer's own page. Kept on the Pricing page and listed by `list_alerts`; never sent on any channel, and not in the app's alert list by default. |

"Now" is about time, not size. Pricing never raises a `critical` alert.

## Before you start

Read `references/reading-the-data.md` — §1 (`null` is not zero) and §16 (prices and changes). Three
rules carry most of a pricing report:

- **A price is the page's own number, in the page's own currency.** Never convert, sum or average it.
  The setups card is already ordered cheapest first by the check; you never compute a rank.
- **A change is quoted as the check wrote it** — its `title`, from X to Y with the two dates, and
  its `detail`. Never rebuild it from `from` and `to` with an arrow, and never add a verb of
  interpretation.
- **A company whose page could not be read shows its last read's facts**, dated `shownAsReadAt`.
  Say that date. Its prices are not today's.

## The shape

`get_pricing_dashboard` answers `{ dimension, monitoring, run, nextCheckAt }`. `run` is the newest
completed check, projected onto the cards the Pricing page shows — `null` before the first check.
`monitoring.currentRunning` says a check is in flight now; `nextCheckAt` is the next scheduled check,
`null` when none is scheduled. The response opens with `readingGuide`, the rule for each field in it;
where it is more specific than this file, it wins.

**The null rule on these shapes:** an **absent** key means the page does not say it (we read the
page; it is not there). **`null`** means we did not measure it, with the reason in a sibling
`…Available` object (`factsAvailable`, `setupsAvailable`). A measured zero is a zero; an empty list
means we looked and found none.

Companies are served by `domain`. Use the domain as served, or the name the check's own `title` uses;
never derive a name from a domain — a capitalised domain is wrong for a third of most rosters.

Four things on the shape you read past: `run.progress` is the check's working count of every page
it read, sitemaps and homepages included — never quote it; the header's counts are the pricing
pages. `run.market` says the market's `kind` (`published`, `quote_only` or `mixed`: which cards the
check built), the `unit` it prices on in the market's own word, and when the setups were written
(`decidedAt`). On a fact, `limits` is the plan's numbers as the page lists them, a map in the page's
words, and `variant` names which version of a page the read saw when the page tests two (`default`
otherwise). A `nextCheckAt` earlier than today is served as it stands: say the date, in the past
tense.

## Steps

**1. Resolve.** `list_projects` → `list_competitors` (the customer's row is `isOwn: true`) →
`get_project` for when pricing last ran.

**2. `get_pricing_dashboard`.** If `run` is `null`, no check has completed: say so, give `nextCheckAt`,
and stop. Otherwise read the cards below in order. The order is the founder's order of questions: how
far the check got; what needs me; what do I charge; where do I stand; what does each rival charge;
what changed; what is said about me.

**3. How far the check got** — `run.header`. `read` of `pages` pricing pages on `readOn`, as a
visitor from the US. `unread[]` names the companies whose pricing page this check could not read,
each with `shownAsReadAt` where an earlier read exists. `partial: true` means some of what was read
on `readOn` is not on the page yet. `foundNotRead` counts pricing pages found on sites and not read
inside this check; they are read next time.

> "We read 8 of 9 pricing pages on 11 Oct, as a visitor from the US. We could not read vitally.io's;
> its prices are shown as read on 4 Oct. Next check: 14 Oct."

Never give a reason a page could not be read. The next check's date is the answer.

**4. In short** — `run.narrative`. The check's own paragraphs: what needs the reader this check, one
sentence each, each with a number, a name or a date. Quote it; do not rewrite it. Absent when the
check wrote none.

**5. The customer's own prices** — the company in `run.companies[]` with `isSelf: true`. Its `facts`
of kind `plan`, `addon`, `trial`, `visibility` are its plans as a US buyer sees them. A fact carries
`name`, `price { amount, currency, period, billed }`, `altPrice` (the other billing of the same plan,
where the page shows both), `unit`, `includes`, `seats`, `setupFee`, `ai`, `notRead` (what the check
could not read for this fact, in its words), the page's exact `quote`, `pageUrl`, `readAt`.

Print the fact's `price` with its billing in words, and its `altPrice` after it: *$39 a month,
billed annually, or $46 a month billed monthly*; *$9 a seat a month*; cents as the page shows them
(*$16.50*). An `amount` of 0 is a free plan. `visibility: gated` is *quote only*; `starting_from` is
*from $X*; a plan with no `price` key shows no amount on the page. `egress` on a fact is the exit
the read came from, and the day of `readAt`, as served, is the fact's date.

**6. Where the customer stands** — `run.setups[]`, built by the check's code from each company's
setup quote. The setups are two or three typical buyers in this market, written on the first check
and kept the same so the order means the same every time; each is priced at the cheapest plan that
fits it. Per setup: `label` (the buyer in words), `assumptions` (which say which rate the rows
carry — the monthly, or the annual rate a month; say it once with the table), `rows[]` cheapest
first with `rank`, `plan`, `price`, the page's `quote`, `pageUrl`, `readAt`; then the rows that
cannot serve it, with `fits: false` and the page's own `reason`; then `notPriced[]`.

- The rank sentence, only when `of` is 2 or more: *For {label}, {cheapest} is cheapest at {price}
  and you are {customerRank} of {of} at {your price}.* `of` counts the companies priced for this
  setup, not the roster, so the lines under the table (*not priced*, *could not be read*) always go
  with it. With one priced row: *Only your {plan} is priced for this setup so far*, or *Only
  {domain}'s {plan} is priced…* when the one row is a rival's. On a project's first check the
  setups were written on this check: say *chosen on this first check and kept the same from here*.
- `customerRank` absent: the customer either publishes no price for this setup or cannot serve it.
  The customer's own row says which — `fits: false` with the page's reason, or a `notPriced` entry.
- `notPriced` is a company with no price for this setup: `could_not_read` (its page was not read),
  or `no_quote` (read, and the check priced no plan for it). Say *not priced for this setup* or
  *could not be read*. Never a machine word.
- `monthlyNotOnPage: true`: the price is the annual rate and the page shows no monthly price for it.
- `setups: null` with `setupsAvailable.reason: "quote_only_market"`: the market publishes no
  comparable prices; read step 7. `not_built`: the check built none.

You never compute a rank, never average the column, and never add the customer's price to a row
the check did not price.

**7. Prices found elsewhere** — facts of kind `external_price`, on quote-only and mixed markets.
Each carries where it was found (`source { kind, url, date }`) and `perYear` where the check wrote
one: the yearly figure, one multiplication inside the check (×12 for a monthly price), absent for a
per-seat price. Quote the source and both dates: *the median of 379 buyers, $44,200 a year (Vendr,
read 11 Oct; its figures dated Sep 2026)*. A buyer-reported median covers every company size and
module — say so. No median across companies, no band.

**8. What each company charges** — every rival in `run.companies[]` (the customer's own plans are
step 5), one block each, dated by its own read. `state` says what the block can show:

| `state` | The block |
|---|---|
| `read` | the facts, read at `read.readAt` from `read.egress` |
| `could_not_read` | the last read's facts, *shown as read on `shownAsReadAt`*; this check tried on `attemptedAt` |
| `never_read` | *We have not read its pricing page yet.* `configuredUrl` is the page set in the project and `attemptedAt` when this check tried it; `factsAvailable.reason: "never_read"` |
| `no_page` | *No pricing page set.* With `lookedAt`, the URL the check tried on its site: *No pricing page set. We looked at {lookedAt} on {attemptedAt} and could not read it.* Such a company is also in the header's `unread` and in a setup's `notPriced` as `could_not_read`: one page tried and not read, said once |

`configuredPage` is present when the prices come from another page than the one set in the project:
*Read at {read.url}; the page set in the project, {configuredUrl}, {redirects there / was not found /
shows no prices}.* `read.egress: "eu"` means the US read failed and the page was read from Germany —
say so on that block only; every other read is from the US. `priceSets` means the page showed two
price sets this check: a test, listed as *showing two price sets since {since}*, never a change.

A company that shows no prices: *Shows no prices. Its pricing page says: '{quote}'.* A promotion
(`kind: "promotion"`): *{name} is at {price} (read {date}). Its page says: '{quote}'.*

**9. What each plan includes** — the same `plan` facts, one row per plan: `setupFee`, `seats` (a
number, or *unlimited* when the page says so), `ai` (as the page puts it: *included*, *add-on*,
*metered: credits*), `unit` (what it prices on, in the page's word: *seat*, *monitor*, *responder
license*, *company ARR*), and the company's `trial` fact on each of its rows (*{n} days*, or *yes,
length not shown*). *Prices shown* is the company's: *every plan* when every plan it lists has a
price (a gated enterprise tier aside), *from {price}* when a plan is `starting_from`, *none* when no
plan is priced. A field the page does not state is absent — leave the cell blank, and never fill it
with *none*. *None* is a value only when the page says so.

**10. Changed since {date}** — `run.changes[]`, newest first, records included; `run.changesSince` is
the previous check's date. Each is one confirmed change: quote its `title` verbatim (one sentence:
the company and the plan with what it includes, from X to Y in words, the two read dates), then its
`detail` (one more sentence: the customer's own number, the rank line, or the page's quote), the
level in the customer's words, `pageUrl` as the live page, and `quoteBefore` / `quoteAfter` as *the
page's words, before and after*. A company closing or bought also raises its own *Tell me now* line
here. This card is always shown: `changesSince` absent is *First check on {readOn}. Changes show
from the next check on*; no changes is *Nothing changed since {date}*.

> **Tell me this week** · *statuscake.com's free plan went from 10 monitors to 3 between 28 Sep and
> 5 Oct.* Its check interval went from 5 minutes to 15. Yours has 50 monitors at 5 minutes. · 5 Oct ·
> the live page · the page's words, before and after

**11. About you** — `run.aboutYou[]`, in the order served: the market's lines about the customer
first, the customer's own board last. `kind` is one of `listing_misquotes_price` (a site lists the
customer at a price their own page does not say), `page_names_you` (a rival's page names the
customer's price or plans), `switching_offer` (a rival offers the customer's customers something),
`board_ticket_stale` (a ticket on the customer's board quotes a line no longer on their page). Each
carries `quote`, `pageUrl`, `pageDate` (the date the page itself carries) and `firstSeen` (when the
check found it) — say both, never *first seen* alone: *their page is dated 5 May; we found it on 11
Oct*. `ourPageSays` is what the customer's own page says beside it. On a stale ticket, `ticket`
names it and `thereOn` is when the quoted line was last read on the page.

**12. Closed, renamed or bought** — `run.marketEvents[]`: the check's `title` and `detail`, the
`quote` that states the event, `pageDate`, `firstSeen`. Said once; the other cards keep the
company's name as served.

**13. One check, or the run before.** `get_pricing_history` lists checks newest first:
`completedAt`, `pagesRead` (pricing pages, one per company — never a sitemap or a homepage),
`pagesFailed`, `partial`, `changes` counted by level, `egress` (the exits its reads came from).
`get_pricing_run_detail` with a `runId` answers the same cards for that check. Compare two checks by
their own dates, and say which date each figure is from.

**14. The alerts, by level.** `list_alerts` with `dimension: "pricing"` and `level` (`now`,
`this_week`, `record`) lists every pricing alert, a record included — it is stored there and never
sent. Each carries `title` and `detail` verbatim, `level` beside `severity`, and `context.pricing`
(version 4): a `change` with `from`, `to`, `readAt`, `previousReadAt`, `pageUrl`, `quoteBefore`,
`quoteAfter`, or a `marketEvent`. An alert is written once and never revised: quote it as of its
`createdAt`.

## Output

```markdown
# Pricing — {Project}
*Read {read} of {pages} pricing pages on {readOn}, as a visitor from the US. Next check: {date}.*

## In short
{run.narrative, quoted. Then the unread companies, each with the date its prices are shown from.}

## Your prices · read {date}
| Plan | Price | Billed | Includes |
{the customer's plan facts, as the page shows them; the free plan, the trial, the add-ons as lines}

## What typical setups cost · priced on {date}
**{setup label}** · {the rank sentence}
| | Company | Plan | A month |
{rows cheapest first; the customer's row marked; then "Can't serve this setup: …" with the page's
reason; then "Not priced: …"}

## What each company charges
### {domain} · read {date} from the US · [pricing page]
{the plan table, the trial and add-on lines, the state line where the block is not `read`}

## What each plan includes
| Company | Plan | Setup fee | Trial | Users included | AI | Priced per | Prices shown |
{blank = not on the page}

## Changed since {date}
- **{Tell me now / Tell me this week / Keep a record}** · {title} {detail} · [page] · the page's
  words, before and after

## About you
{the lines, in the order served, each linking to its page}

## Closed, renamed or bought
{title · detail · quote · dates}

## Questions for Monday
{3–5 questions tied to what this check showed; see Decision questions}
```

Leave out any section with nothing true to say, except *Changed since*, which always has its line.
Every row carries the date of its own data.

## What NOT to do

- **Never do arithmetic on a price.** No conversion, no sum, no average across companies, no price
  position. The one multiplication is the check's `perYear`, and it is marked as the check's.
- **Never compute a rank.** The setups card is the order; you report it. If the customer has no
  `customerRank`, say why from the row, not "unranked".
- **Never write a change with an arrow or a verb of interpretation.** *Went from $24 to $29 a month
  between 4 and 11 Oct*, never *$24 → $29*, never *signals a move upmarket*. <!-- facts-ok: the bad example -->
- **Never read a company that could not be read as one that has no prices.** Its block shows the
  last read's facts with their date; `never_read` and `no_page` are the only states with no facts.
- **Never fill a blank.** A field absent from a fact is not on the page; *none* and *0* are values
  the page stated.
- **Never give a reason a page could not be read**, and never say what the check will do about it.
  The next check's date is the whole sentence.
- **Never re-fetch a pricing page yourself to check a price.** The check reads from the US; a fetch
  from anywhere else can show another currency or another amount, which is the vantage, not a
  change.
- **Never derive a company's name from its domain.** Use the domain as served, or the name the
  check's own title uses.
- **Never add a "so what".** The levels and the order do the sorting; advice is the briefing's.

## Decision questions

3–5 at the end of the report, tied to what this check actually showed, each with its branches where
they differ. A question is not advice: it names the fact and asks what the reader wants to do about
it.

> "For 100 monitors at 30-second checks and 3 users, hyperping.com is cheapest at $29 and you are
> 2nd of 9 at $46. That gap has held for three checks. Is $46 a price you hold on what the Team
> plan includes, or is this the check to bring to the next pricing review?"
