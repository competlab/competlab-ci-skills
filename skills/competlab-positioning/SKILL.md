---
name: competlab-positioning
description: |
  Reads CompetLab's Positioning dimension — what every tracked company says on its homepage as the page says it (the headline, the line under it, what it calls itself, who it says it is for, the main button, the numbers, badges and features it claims, the price it leads with), which of the customer's own claims other tracked companies also make and which nobody else does on the homepages read, every confirmed change written from X to Y with its two dates and its level, what pages say about the customer, and the companies that closed, were renamed or bought. Use when the user asks "how do my competitors describe themselves", "did anyone change their headline", "what do we say that nobody else does", "who says what we say", "what do pages say about us", "is anyone offering our customers a deal to switch", "what changed on their homepage", or "positioning report". NOT for what they charge (use competlab-pricing), NOT for a card to read on a sales call (use competlab-battlecard) and NOT for one rival across every dimension (use competlab-competitor-dive). Requires the CompetLab MCP server with an active project.
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__get_project mcp__competlab__list_competitors mcp__competlab__get_positioning_dashboard mcp__competlab__get_positioning_history mcp__competlab__get_positioning_run_detail mcp__competlab__list_alerts Read
metadata:
  author: competlab
  version: "3.5.1"
  website: https://competlab.com
  category: competitive-intelligence
---

# Positioning — what each company says, read from its homepage

## The question this dimension answers

**What does each company in this market say about itself on its homepage today, in the page's own
words; which of the customer's claims does nobody else make; what changed since the last check; and
what do pages say about the customer?**

A check reads every tracked company's homepage — the customer's own included — as a visitor from the
US, and keeps what the page says verbatim, with the quote it sits in. It also reads the customer's own
pricing page, and the pages on other sites that name the customer. It compares the read with the
previous one and raises a change only when a second read confirms it. A headline that switches back and
forth between two versions, a reordered list and a line rewritten with the same words are not changes.

Every claim it reports is on the page today, and a change's before is the page as it was, with the date it was
read on. The two things it adds are the comparison between this read and the last, and the matching: the customer's own claims set
beside the tracked companies that say the same, found by the check.

## What it is not

It reports what pages say, with the facts around it. **Strategy, advice and tickets are the Strategic
Briefing's.** Nothing on this surface scores, grades, buckets or advises: there is no score of how
strong a message is, no audience bucket, no market-wide theme map, no "similar claim" badge and no
"consider changing your headline". A report built on this dimension states the words, the dates, the
changes and who says the same, and stops.

## The three levels, in the customer's words

Every change the check confirms carries a `level`. Use the customer's words for it, never the token:

| `level` | Say | What it covers |
|---|---|---|
| `now` | **Tell me now** | A page about you published since the last check, or a claim about you that your own page contradicts, on a rival's site; an offer aimed at your customers; a rival's homepage going free; a rival closing or bought. |
| `this_week` | **Tell me this week** | A rival's headline, page title or what it calls itself rewritten; who it says it is for added or dropped; its main button changing kind; a price its homepage leads with moving; a number or badge it claims that matches one of yours. |
| `record` | **Keep a record** | Its other numbers and badges, its main button's words, the line under its headline, a rival renamed. Kept on the Positioning page and listed by `list_alerts`; never sent on any channel. |

A page about you that was already there when the check found it is a line under About you, never an
alert. "Now" is about time, not size. Positioning never raises a `critical` alert.

## Before you start

Read `references/reading-the-data.md` — §1 (`null` is not zero) and §17 (claims and changes). Four
rules carry most of a positioning report:

- **A claim is the page's own words, verbatim.** Never summarise, shorten, bucket or score it. The
  claim is `value`; the words around it are `quote`. An audience or a category is kept as the page
  writes it.
- **An empty `saidBy` is an answer, and it is scoped.** *Nobody else says it on the homepages the check
  read; their pricing pages may.* Never call a claim unique, never say a rival "does not offer" it. <!-- facts-ok: the bad example -->
- **A change is quoted as the check wrote it** — its `title`, from X to Y in the page's words with the
  two dates, and its `detail`. Never rebuild it from `from` and `to` with an arrow, and never add a
  verb of interpretation.
- **Every line about the customer is the pages' words with their dates, never a judgement of a page.**
  Where the customer's own page says otherwise, both are quoted, each with its date, and neither is
  called anything.

## The shape

`get_positioning_dashboard` answers `{ item }`, and `GET /v1/projects/{id}/positioning` answers the
same. `item` is the newest completed check, projected onto the cards the Positioning page shows, and it
opens with `readingGuide`, the rule for each field it carries — where the guide is more specific than
this file, it wins. Then `runId`, `completedAt`, `language`, `header`, `narrative`, `companies`,
`yourClaims`, `changes` (and `changesSince` from the second check on), `aboutYou`, `marketEvents`,
`progress`, `partial`, and `nextCheckAt`. Before the first completed check there is no `item`: the tool
answers the error `no_data_available` (`/v1`: 404) — say that no positioning check has completed yet,
and stop; nothing in this answer says whether one is running. `nextCheckAt` is the next scheduled check;
when it is absent and `nextCheckDue` is `true`, a check is due and waits its turn — say *Next check: due
now*, never a time of day; absent otherwise, none is scheduled — say *No check scheduled*. A
`nextCheckAt` earlier than today is served as it stands: say the date, in the past tense.

**The null rule on these shapes:** an **absent** key means the page does not say it (we read the page;
it is not there). **`null`** means we did not measure it, with the reason in a sibling `…Available`
object (`claimsAvailable`). A measured zero is a zero; an empty list means we looked and found none.

**`view`.** The default is compact: each company's claims are trimmed to what each claim is and its
value (`kind`, `value`, and where they apply `number`, `unit`, `buttonKind`, `buttonKindWord`,
`fromMarkup`). Every other card is whole in both views, including each `saidBy` entry's quote and every
change's quotes. Ask for `view: "full"` when the report prints the page's words around a claim (`quote`),
links the page (`pageUrl`), dates a claim (`readAt`) or says where it was read from (`egress`,
`variant`: which version of the page was read, `default` where the site serves one). The sections
below say which step needs it.

**The check's own sentences** — `narrative`, every change's `title` and `detail`, every About-you
`line` — are written in one language for the whole check, `language` (a BCP-47 tag), and address the
customer as *you*. Quote them as written. A quote stays in its page's own language and is never
translated.

A company carries its `domain` and, when the check stored it, its own `name` as its page writes it.
Use the name where it is served and the domain where it is not; never derive a name from a domain. The
check's own `title` already uses the page's name. Ids (`competitorId`, `claimId`, `alertId`, `runId`)
join one card to another; they are never printed.

`item.progress` is the check's working count, including pages found and left to the next check — never
quote it; the header's counts are the ones the page shows. `partial: true` means the check's time ran
out before it judged everything: what is here holds, and the rest comes with a later check. A company
that could not be read does not set it.

## Steps

**1. Resolve.** `list_projects` → `list_competitors` (the customer's row is `isOwn: true`) →
`get_project` for when positioning last ran.

**2. `get_positioning_dashboard`.** Compact is enough for the headline, the line under it, what a
company calls itself, who it is for, the main button, the numbers, the badges, the features and the
price it leads with, for the whole of step 5, and for steps 7 to 9. Use `view: "full"` when step 6 needs
the page's words around a claim or a dated link. If it answers `no_data_available`, no positioning check
has completed: say so and stop. Otherwise read `item`'s cards below in order. The order is the founder's
order of questions: how far the check got; what needs me; what do I say that nobody else says; what
does each rival say; what changed; what is said about me; who left.

**3. How far the check got** — `item.header`. `read` of `pages` homepages on `readOn`, as a visitor
from the US — the customer's own homepage counts among them, and the sentence says it apart from the
rivals': *We read your homepage and all 8 rivals' on 11 Oct*; with one rival, by name (*your homepage
and Orbitcheck's*); *7 of 8 rivals'* when some were not read. When the customer's homepage was not read
it leads the could-not-read clause. `unread[]` names the companies whose homepage this check could not
read, each with `shownAsReadAt` where an earlier read gave claims. A company read whose `claims` is
`null` with `claimsAvailable.reason: "not_judged"` is a page read; it is never among the unread. The
pages naming the customer follow in the same sentence: `pagesNamingYouRead` read this time,
`pagesNamingYouWithLines` of them with a line under About you, and `pagesNamingYouToRead` left to the
next check as their own sentence. Say *Germany* only for a company whose read came from there
(`read.egress: "eu"`).

> "We read your homepage and 7 of 8 rivals' on 11 Oct, as a visitor from the US; Statusly's from
> Germany. We could not read Orbitcheck's; its lines are shown as read on 4 Oct. We read 23 pages that
> name you, 2 of them with a line under About you; 4 more wait for the next check. Next check: 14 Oct."

The edges: *We found no page that names you.* and *We read no page that names you; 4 wait for the next
check.* Never give a reason a page could not be read. The next check's date is the answer.

**4. In short** — `item.narrative`, `blocks[]` of `prose` and `heading`, quoted in order. The check's
own paragraphs: who names the customer and what they say, what the customer says that nobody else
does, what moved. Quote it; do not rewrite it. Absent when the check wrote none.

**5. Your claims, and who else says the same** — `item.yourClaims[]`, built by the check's code from the
customer's homepage and pricing page. Each row is one of the customer's main claims: `kind`, `value` (the
claim as the page prints it), `quote`, `pageUrl`, `page` (`homepage` or `pricing`; absent for another
page), and `saidBy[]`: each tracked company the check found saying the same, with its `quote` in its own
words, its `value` where the check kept the claim (a number's own figure, *9 regions*), its `pageUrl`,
and its `kind` where it differs from the customer's. Print the claim as the page prints it with the
page in brackets, and each company beside it by its served name with its quote.

- **An empty `saidBy` is a dash and a sentence:** *— nobody else says it on the homepages the check
  read; their pricing pages may.* It is the answer to "what do I say that nobody else says". Never
  *unique*, never *only you*, never *a gap*, never *an opportunity*. <!-- facts-ok: the bad example -->
- **A number is listed with the company's own figure for the same thing:** *You say '5 monitoring
  regions' · Orbitcheck: '17 monitoring regions'.* The two figures and the two quotes. Never *more*,
  *fewer*, *ahead*, *behind*. A price the homepage leads with is the same.
- `saidBy` holds tracked companies only. A company the project does not track is not in it, and its
  absence says nothing about what that company says.
- `yourClaims: null` means the check built none for this check: say so. It never means the customer
  makes no claim.

**6. What each company says** — every rival in `item.companies[]` (the customer's own claims are step
5's), one block each, dated by its own read. The customer's own row is `isSelf: true`; it carries the
claims that step 5 matches. `state` says what the block can show:

| `state` | The block |
|---|---|
| `read` | the claims, read at `read.readAt` from `read.egress` |
| `could_not_read` | the last read's claims, *shown as read on `shownAsReadAt`*; this check tried on `attemptedAt` |
| `never_read` | *We have not read its homepage yet.* `configuredUrl` is the homepage set in the project and `attemptedAt` when this check tried it; `claimsAvailable.reason: "never_read"` |
| `no_page` | *No homepage set.* `claimsAvailable.reason: "no_page"` |
| `read`, `claims: null`, `claimsAvailable.reason: "not_judged"` | *Read on {readAt}; nothing to show from this check. Next check: {date}.* Nothing is claimed about what its page says, and no earlier read's claims are served here |
| `read`, `claims: []` | *Nothing to show from its homepage: no headline, button or other claim on it.* With `onlyAboutYou: true`, every claim the check kept of the page is about the customer: the same sentence, and what it says about you is under About you, said once |

Never read `null` as *says nothing*: only an empty list is a page read that makes no claim the check
keeps. On `could_not_read` and `never_read`, `configuredUrl` is the page set in the project.

A block with claims is the page's words, grouped by `kind`, in the check's order:

> **Orbitcheck** · read 11 Oct from the US · homepage
> Headline: *'Monitoring that never cries wolf'*
> Under it: *'Checks every 30 seconds from 17 monitoring regions.'*
> Calls itself: *'an uptime monitoring platform'* · For: *'teams that ship daily'*
> Main button: *'Request a walkthrough'* (a demo) · Claims: *'17 monitoring regions'*, *'SOC 2 Type II'*
> Pages naming you: 3 — *'Orbitcheck vs Lumenwatch'*, …

`headline` is **Headline**, `subheadline` **the line under it**, `category` **what it calls itself**,
`audience` **who it says it is for** (several are listed; each is the page's words), `main_button` **the
main button** with its kind in words (`free_start` *a free start*, `trial` *a trial*, `demo` *a demo*,
`sales` *sales*, `pricing` *pricing*; `other` with the check's own word in `buttonKindWord`), `proof`
**the numbers it claims** (the `value`, with `number` and `unit`), `badge` **the badges it shows**,
`feature` **what it says it does**, and `price` **the price it leads with**, among *Claims*, as the page
prints it. `title` (the page's title, as search shows it) and `meta_description` (the line search shows
under it) are kept and appear in step 7 when they move; the block does not print them. A claim with
`fromMarkup: true` was read from the page's markup, not its visible text: say so if you print it.

`pagesNamingYou[]` is a count and the titles (`title`, or the address where there is none; `pageDate`
where the page prints one; `read: false` is a page found and left to the next check). What those pages
say about the customer is under About you. It is absent on the customer's own row.

**7. Changed since {date}** — `item.changes[]`, newest first, records included; `item.changesSince` is
the previous check's date. Each carries `kind`: `change`, a confirmed change, or `market_event`, a
company closing, renamed or bought, which carries only `title`, `level` and `pageUrl` here — its words
and its date are its entry in `item.marketEvents` (step 9); say it from there, and never look for
`detail` or quotes on it. A `change` is one confirmed change: quote its `title` verbatim (one sentence:
the company and what moved, from X to Y in the page's words, the two read dates), then its `detail` (one
more sentence: what moved with it, or the customer's own line), the level in the customer's words,
`pageUrl` as the live page, and `quoteBefore` / `quoteAfter` as *the page's words, before and after*.

- `field` names what moved as the check keys it: the thing's kind, with the words or the name after a
  colon where a page can have several (`headline`, `audience:agencies`, `proof:regions`,
  `main_button.kind`); `name` is a proof's, badge's or feature's name.
- **`from` and `to` are the page's words. An empty `from` is a thing added** (an audience named, a page
  about the customer published, a sentence about the customer newly on a tracked page); **an empty `to`
  is a thing gone** (an audience dropped, a price no longer shown). Say *now says* and *no longer
  names*; never *added to* or *removed from* as a decision of the company's.
- `previousReadAt` and `readAt` are the two reads compared; say both. `egress` is where the change's
  own read came from; say *Germany* only when it is `eu`.
- The head and the hero are one change: when the headline, the page title, the meta description, what
  it calls itself and who it is for moved in one read, the check wrote one change, at the highest level
  among them, and the others are its `detail`. Do not split it.
- A page about the customer published since the last check, a new sentence about the customer on a
  tracked page and an offer on a tracked page are also lines under About you. **Report each once:**
  state it here, with its level and the check's title, and do not repeat it under About you.
- This card is always shown: `changesSince` absent is *First check on {readOn}. Changes show from the
  next check on. From the next check, a rival's rewritten headline or a new audience is a Tell me this
  week alert; a page about you published since the last check is Tell me now.*; no changes is *Nothing
  changed since {date} on the pages we read.*, with the not-judged companies named under it (*Statusly
  has nothing to show this check.*) and the unread ones as step 3. The empty list covers the companies
  the check compared, never those in `header.unread` or those whose `claims` is `null`.

> **Tell me this week** · *Orbitcheck's homepage headline went from 'Uptime checks for teams that ship
> daily' to 'Monitoring that never cries wolf' between 4 and 11 Oct.* Its page title and the line search
> shows under it moved with it. · 11 Oct · the live page · the page's words, before and after

**8. About you** — `item.aboutYou[]`, in the order served (the market's lines first, the board's
ticket last). `kind` is one of five:

| `kind` | The line says |
|---|---|
| `switching_offer` | a page offers the customer's users a deal to switch |
| `statement_contradicted` | a page says something about the customer's price, plan, free-plan terms or a feature, and the customer's own page says otherwise |
| `page_about_you` | a page about the customer, its title or address naming it, already published when the check found it |
| `comparison_page_stale` | a tracked company's page now says something other than what the customer's own comparison page says of it |
| `board_ticket_stale` | a ticket on the customer's board quotes a line no longer on the customer's page |

The last two kind names are wire names, matched by code and never said to a reader; the sentence says
what they are in the table's words.

**`line` is the check's own sentence for it, in the project's language, addressed to the customer as
*you*. Quote it as written.** It is absent on a line from a check older than the field; then compose it
from the parts, in English, in these forms, the quotes in single quotes and no full stop after a closing
quote:

- `page_about_you`: *{Company}'s page '{pageTitle}' (dated {pageDate}) says of you: '{quote}'.* The
  page's own date in the line; `firstSeen` (*we found it on {date}*) in a hover or the detail, never
  both in one sentence. Undated: *(undated)*, or *(undated; new in its sitemap since {sitemapNewSince})*
  only when `sitemapNewSince` is served. A page with no title is named by its address.
- `statement_contradicted`: *{Company}'s page '{pageTitle}' (dated {pageDate}) says '{quote}'. Your
  {ourPageName} says '{ourPageSays}' (read {ourPageReadAt}).* (*say* for Terms.)
- `switching_offer`: *{Company} offers your customers '{quote}' on its page {pageUrl}; we found it on
  {firstSeen}.*
- `comparison_page_stale`: *{Company}'s {page} now says '{quote}' (read {readAt}); your {ourPageName}
  says '{ourPageSays}'.* `page` is the company's page in words (*homepage*, *pricing page*). With no
  `ourPageSays`: *…; your page {address of ourPageUrl} says otherwise.*
- `board_ticket_stale`: *Ticket #{ticket.number} on your board, '{ticket.title}', quotes a line your
  {ourPageName} no longer has: '{quote}' (there on {lastSeenAt}, gone by {firstSeen}). The ticket is
  still open.* Without `lastSeenAt`, because the check never saw the line there: *(not there when we
  read it on {firstSeen})*; never *gone by* for a line the check never saw. With no ticket number or title, *A ticket
  on your board quotes…*.

Rules for every kind:

- **A line is the page's words with their date** and, on `statement_contradicted`,
  `comparison_page_stale` and `board_ticket_stale`, the customer's own page's words with theirs
  (`ourPageSays`, `ourPageName`, `ourPageReadAt`). Report them as they are. Never say which page is
  right, never call either page anything, never add a label to it.
- **Dates are the page's.** `pageDate` is the date the page itself prints; absent is *undated*. An
  offer carries its found date; a page about the customer carries the page's own date; the customer's
  own words carry their read date. When a line has `sitemapNewSince`, say it as a fact of the sitemap,
  never as the page's date.
- `tracked: false` is a site the project does not track: name it and say so (*UptimeTools, which you do
  not track, …*). Suggesting it for the roster is the briefing's.
- A page that merely mentions the customer is not a line. When it is the only thing: *Named on 14 pages
  we read, none saying anything about you.* A page the check named and could not read is counted, never
  quoted.
- **The section is hidden when empty.** Never fill it.

> *UptimeTools, which you do not track, has a page 'Lumenwatch pricing' (dated 5 May) that says of you:
> 'free for personal, non-commercial use'. Your Terms say 'available for any use, including commercial'
> (read 11 Oct).*

**9. Closed, renamed or bought** — `item.marketEvents[]`: the check's `title` and `detail`, the `quote`
that states the event, `pageDate`, `firstSeen`. Said once; the other cards keep the company's name as
served. A closing or a purchase is *Tell me now*, a new name is *Keep a record*. If the Pricing report
for the same project already says it, say it once.

**10. One check, or the run before.** `get_positioning_history` lists checks newest first: `completedAt`,
`pagesRead` (homepages, one per company — never a sitemap or another page), `pagesFailed`,
`pagesNotJudged` (homepages read for which the check wrote nothing; counted in `pagesRead` too; their
companies are in the run detail), `pagesNamingYouRead`, `partial`, `egress` (the exits its reads came
from), its `changes` in full, and its `marketEvents`. Page it with `page` and `limit`, and read
`pagination.hasMore`. `since` (an ISO 8601 date or moment) keeps the checks completed at or after it:
for *what changed since 1 May*, read every row's `changes`. A row whose `changes` is empty means nothing
changed among the companies that check compared, not among those it could not read or wrote nothing
for. The history opens with its own `readingGuide`. `get_positioning_run_detail` with a `runId` from
the history answers the same cards for that check, and `view` works as on the dashboard; a malformed id
answers `invalid_run_id`, an id that is not a completed check of this project `run_not_found`. Compare
two checks by their own dates, and say which date each figure is from.

**11. The alerts, by level.** `list_alerts` with `dimension: "positioning"` and `level` (`now`,
`this_week`, `record`) lists every positioning alert, a record included — it is stored there and never
sent. Each carries `title` and `detail` verbatim, `level` beside `severity`, and `context.positioning`
(version 1): a `change` with `kind`, `field`, `name`, `from`, `to`, `readAt`, `previousReadAt`,
`pageUrl`, `quoteBefore`, `quoteAfter` and `egress`, and on a page or a sentence about the customer the
page's title and date and the customer's own page beside it (`ourPageSays`, `ourPageUrl`, `ourPageName`,
`ourPageReadAt`); or a `marketEvent`. An alert that names `samePricingAlert` is the same fact the
pricing alert told first; both keep their level, and each channel was told it once — say it once. An alert is written once and never revised:
quote it as of its `createdAt`.

## Output

```markdown
# Positioning — {Project}
*Read your homepage and {rivals read} of {rivals} rivals' on {readOn}, as a visitor from the US. {Pages
naming you.} Next check: {date} — or "due now", or "No check scheduled".*

## In short
{item.narrative, quoted. Then the unread companies, each with the date its lines are shown from.}

## Your claims · read {date}
| You say | Who else says it |
{each claim as the page prints it, the page in brackets; each company with its quote; a dash with
"nobody else says it on the homepages the check read; their pricing pages may" where saidBy is empty}

## What each company says
### {name, or the domain where none is served} · read {date} from the US · [homepage]
{headline, the line under it, what it calls itself, who it is for, the main button and its kind,
claims; pages naming you; the state line where the block is not `read`}

## Changed since {date}
- **{Tell me now / Tell me this week / Keep a record}** · {title} {detail} · [page] · the page's
  words, before and after

## About you
{the lines, in the order served, each linking to its page}

## Closed, renamed or bought
{title · detail · quote · dates}

## About this page
We read your own homepage, pricing page and comparison pages too: About you shows a ticket whose quoted
line has left your page, and what a rival's site now says beside what your comparison page says.
Words are what a visitor from the US sees.
{Only when Changed since lists a change:} A headline that switches between two versions, a reordered
list or a rewritten line with the same words is not a change.

## Questions for Monday
{3–5 questions tied to what this check showed; see Decision questions}
```

Leave out any section with nothing true to say, except *Changed since*, which always has its line. The
customer's own claims are *Your claims*, not a block in *What each company says*. Every row carries the
date of its own data.

## What NOT to do

- **Never score, rank, grade or bucket.** No strength of a message, no share of voice, no count of how
  many companies say a thing as a percentage, no ordering of the headlines. A count is a count with its
  universe: *3 of 8 rivals*, never a share.
- **Never call a claim unique.** An empty `saidBy` is *nobody else says it on the homepages the check <!-- facts-ok: the bad example -->
  read; their pricing pages may*.
- **Never write a change with an arrow or a verb of interpretation.** *Went from 'Uptime checks for
  teams that ship daily' to 'Monitoring that never cries wolf' between 4 and 11 Oct*, never *'A' → 'B'*,
  never *signals a pivot*, *repositions*, *doubles down*, *goes upmarket*. <!-- facts-ok: the bad example -->
- **Never say a page is wrong, stale, out of date or contested, and never say which of two pages <!-- facts-ok: the lock's list -->
  is right.** The two pages' words with their dates are the whole statement.
- **Never infer a motive.** No *because*, *in response to*, *after you published*, *as a result*. Two
  facts and a date, with no verb between them.
- **Never read `null` as "says nothing".** `claims: null` is a page not measured or not judged, with the
  reason in `claimsAvailable`; only an empty list is a page read that makes no claim the check keeps.
- **Never read a company that could not be read as one with no claims.** `could_not_read` shows the last
  read's claims with their date; `never_read` and `no_page` are the only states with none.
- **Never summarise a claim or fill a blank.** A field absent from a claim is not on the page.
- **Never give a reason a page could not be read**, and never say what the check will do about it. The
  next check's date is the whole sentence.
- **Never re-fetch a homepage yourself to check a line.** The check reads from the US; a fetch from
  anywhere else can show another language, another price or another version of the page, which is the
  vantage, not a change.
- **Never derive a company's name from its domain.** Use the domain as served, or the name the check's
  own title uses.
- **Never translate a quote or the check's sentences.** They are printed in the language they were
  written in.
- **Never add a "so what".** The levels and the order do the sorting; advice is the briefing's.

## Decision questions

3–5 at the end of the report, tied to what this check actually showed, each with its branches where
they differ. A question is not advice: it names the fact and asks what the reader wants to do about it.

> "Orbitcheck's homepage headline went from 'Uptime checks for teams that ship daily' to 'Monitoring that
> never cries wolf' between 4 and 11 Oct. Yours says 'Monitoring that costs nothing to start'. Is that
> the line you want a visitor to hold beside it, or is this the check to bring to the next homepage
> review?"

> "Nobody else says 'Create a monitor in a minute' on the homepages the check read; their pricing pages
> may. Is it a claim you want to keep on the homepage, or one that belongs on the pricing page where it
> already stands?"
