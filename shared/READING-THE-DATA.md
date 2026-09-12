# Reading CompetLab data

Load this before reporting any CompetLab figure to a person.

CompetLab measures the open web, which fails in ordinary ways: a site times out, blocks the crawler,
or has no pricing page. The API is careful about the difference between *we measured this and it is
zero* and *we did not measure this*. A report that collapses the two is worse than no report, because
it is confidently wrong in a direction the reader cannot check.

Everything below is a rule the platform already enforces on itself. Your job is not to add analysis
on top of it — it is to not undo it.

**The facts these rules apply to** — the six dimensions, the five engines, the tool map, the endpoint
and the answer-size costs — are in `PLATFORM.md`, beside this file. Open it when you need to know
which tool answers a question; open this one before you write a sentence about what came back.

---

## 1. `null` means we did not measure it

**It never means zero, empty, false, or "no".**

A measured value is always reported as itself. A real `0` trust signals, a real `false` for "has a
free plan", a real empty list — those are findings, and you should report them as findings. Only the
unmeasured case is `null`.

```
trustSignals: 0        → measured. "Zero trust signals on the homepage." A finding.
trustSignals: null     → not measured. "We could not read this." Not a finding about the site.
```

Where a reason exists, it arrives in a sibling `…Available` object — `pricingDataAvailable`,
`engineDataAvailable`, `latestCheckDataAvailable`. Read it and pass the reason on.

**One documented exception.** On a trust-signals scan, `headerInspection: { available: false }` is a
note about the *fetch*, not a caveat on the numbers: the page body was read in full, every rule reads
the body and none reads headers, so the tier, score, category scores and signal count are exact.
Report them as you would any other scan — **never as partial, provisional, or a minimum.** All it
rules out is a header-kind evidence entry.

**But some nulls carry no marker, because nothing failed** — there was simply nothing to compare, or
the field does not apply. **A null with no marker beside it is still not a zero.** Never infer "this
must be a real measurement" from the absence of a marker.

An **empty list** means we looked and found none. A **null list** means we did not look. Two
different sentences.

> Never write one sentence that could describe either. "No security headers found" is ambiguous and
> therefore wrong. Write "the scan found no security headers" or "the scan could not read this site",
> and know which one you mean.

This rule exists because an agent once read `compliance: 0`, took it for a measurement, and told a
customer their dashboard reported no privacy policy. It had not been checked.

---

## 2. Counts, never rates

Report figures as **n of N**. Never as a percentage or a share, and never as a bare count.

Every count names its universe on the same object. Quote the pair:

```
answersNamingCustomer of answersReceived
independentPagesNamingCustomer over pagesRead
```

✅ "Named in 8 of the 69 answers pooled across five checks."
❌ "12% mention rate." — a share computed off a small, deliberately small, question set.
❌ "Named in 8 answers." — 8 of what?

**A shortfall is two facts, never a ratio.** Say "8 asked, 6 answered". Do not say "75% completion".

Where the platform *does* publish a share, it ships a confidence range with it (`presence`,
`presenceLow`, `presenceHigh`). Then you may quote the share — but only beside its range and its
count. See §4.

---

## 3. Per engine, never pooled

The engines read different pages and answer differently. A combined figure describes a list none of
them produced.

- Do not sum pages across engines.
- Do not average scores across engines.
- Do not draw engines as slices of one whole — no pie chart, no stacked bar, no shared categorical
  palette. There is no per-engine score, and no surface treats engines as parts of a total.

The one legitimate cross-engine object is the **core**: hosts retrieved by two or more engines. It is
constructed for that purpose. Everything else stays per engine.

**An engine missing from a per-engine record was not asked on that check.** An engine present but
carrying `engineDataAvailable` produced nothing usable. Both mean *not measured* — neither is a fact
about the brand, and neither is a zero.

**A check keeps the model set it ran with.** Older checks ran three or four engines. The absence of a
provider on an old check is not a brand's absence from that provider.

---

## 4. Ranges are not orderings

Presence figures ship as `presence` with `presenceLow` and `presenceHigh` — a 95% interval.

**Two brands whose ranges overlap are not ordered.** `rankByPresence` is shared across ties. Never
break a tie, never call one of them ahead, and never turn an overlap into a narrative.

✅ "The second and third brands are tied — their ranges overlap, so nothing here orders the two."
❌ "{Brand A} edges out {Brand B}."

The same applies over time. A difference between two readings whose intervals overlap is **two
readings, never a movement**. Do not say "rose", "fell", "improved", "declined", or "trending" unless
the intervals are separable and the payload says so.

A count given as a **floor and a ceiling** — `{ floor: 6, ceiling: 9 }` — belongs to a brand whose
name is ordinary language and cannot be matched exactly. **Quote both numbers, never one.**

---

## 5. Nothing is positional

There is no average position on any surface, by design. Brand lists are ordered by **presence** — how
often a brand is named — never by how high it appeared in an answer.

- Never sort, rank, or compare brands by position.
- Never report "average position" or "typical placement". The figure does not exist.
- Measured case: a brand named in 9 of 9 answers rendered twelfth under a position sort. That is why
  the field was removed.

---

## 6. Sign conventions differ between dimensions

`mentionRateGap` on AI Visibility is **the customer minus the leader**. A **negative value means the
customer is behind.**

Reporting a trailing brand as leading is the single most damaging error available on this dimension.
Check the sign before writing the sentence.

**Other dimensions do not share this convention.** Content's `gapPercentage` is an always-positive
magnitude of shortfall. Do not carry one dimension's reading of a "gap" into another.

---

## 7. Retrieved, never cited

For AI Sources, the engines hand back the pages they pulled while answering. **They do not disclose
which of those they leaned on.**

- ✅ "Pages the engine retrieved while answering."
- ❌ "Sources the engine cited." ❌ "Citation count." — the engines publish no such number, so any
  figure you present as one is fabricated.

Two more that follow from it:

- **Named on a page the engine retrieved is not named in the passage it read.** Say the former.
- **A page we could not read is listed, never counted.** It is never treated as a page the brand is
  absent from. Absence is only claimed for a page whose body was fetched and does not name the brand.
- **Pages on a brand's own site, subdomains included, are never independent sources naming it.**

An answered slot with `pagesRetrieved: 0` is an answer that reported no page. Say "no pages
reported". **Never say "answered from memory"** — the engine has not said how it answered.

**Three slot states, never two:** `answered`; `no_answer_shown` (the engine was read and showed
nothing — measured, not an answer, in no denominator); `not_measured` (we could not read it — not a
zero).

---

## 8. Condition codes and caveats are payload — pass them through

Some fields are not raw data. They are decisions the platform already made, and re-deriving them from
the numbers is an error.

- **`verdict`** is a condition code decided when the summary was built. It is never a rating, and
  never something you recompute. State it beside the counts it rests on.
- **`actionHint.text`** — render **verbatim**. Do not paraphrase it into your own recommendation.
- **`limits.sentences`** — the standing caveats for that reading. They travel with the numbers. If you
  quote the figure, you carry the sentence.
- **`explanations`** — every AI-access verdict ships its own sentences, generated from the crawler
  catalog. **Render them; do not paraphrase them into your own claim.** They already encode what
  blocking each crawler costs and how firmly a compliance claim may be worded.

And one shape rule that goes with them: **there is no aggregate boolean and no stored count** on these
surfaces. Derive any total from the length of the array you are quoting, so the number and the names
cannot disagree.

---

## 9. Model prose is the model's, not ours

Answer text, reasoning, sentiment and descriptions are **unverified engine output about the companies
that engine named**, including third parties.

Report it as *what that model said*. Never as CompetLab's assessment, and never as fact.

✅ "Claude described them as an AI intelligence layer that sits on top of existing CRM tools."
❌ "They are an AI intelligence layer that sits on top of existing CRM tools."

A zone or condition token names a measured state about a third party. Say "named in under a tenth of
answers" — not "irrelevant", not "tail".

---

## 10. Google AI Overviews is transcribed, never interviewed

It is a results page, not a chat model. It cannot be asked to rank, rate, or describe anything.

- It **names companies in prose and ranks nothing.** Any order you see is CompetLab's order of first
  mention, computed from the text. **Never report it as a position Google assigned.**
- The profile fields the chat engines produce — sentiment, pricing signal, rationale — are **absent**
  on its entries. A brand row carrying only a name and a domain came from here.
- It has no entry floor. A short or empty overview is the measurement, not a failure.
- Its web-search signal is structurally true — the page fetch *is* the search — so a "search performed
  rate" is meaningless for it.

---

## 11. Reading the Strategic Briefing

`get_briefing` returns the **latest run in whatever state it is in**. Check `meta.status` first.

| `meta.status` | what it means | what to do |
|---|---|---|
| `done` | the briefing is in `item` | read it |
| `running` | being generated now | `meta.progress` gives the step. A run takes about two hours — never report it as late or failed for taking that long |
| `failed` | the last attempt produced no edition | surface it; it does not resume on its own |
| `null` | the project has never had a briefing | only this means genuinely nothing |

On `running` or `failed`, `item` is null **but an earlier edition is usually still readable.** Call
`get_briefing_history`, then `get_briefing_edition`.

> **Never tell a person no briefing is available on the strength of a null `item`.** Check the history
> first. That mistake — reading an empty payload and reporting "no briefing exists" — is exactly what
> the two history tools were added to prevent.

Default to the `hub` section. It answers most questions in one cheap call and names which deeper
section to open next. Read the response's `contains` array to see what that edition actually holds
rather than guessing.

---

## 12. Alerts are off by default

A project with no enabled alert channels is the **expected** state, not a misconfiguration and not a
defect. Zero alerts is not evidence that nothing happened.

---

## 13. Don't lead with a score

AI Visibility answers one question: **who is recommended by AI in this category, and is the customer
one of them?** Core, tail, or neither.

Lead with membership.

✅ "Nine companies make up this market as the models draw it. The customer is not one of them."
❌ "Your AI Visibility Score is 2." — a blended figure that answers a question nobody asked. Treat it
as a known defect rather than a number to build on.

Presence, ranges, per-engine splits and endorsement are **the mechanism that decides membership**.
They are not the answer.

Before leading with the market map at all, read `summary.promptMarket`. Unless its state is
`rivals_named_in_most_answers`, say the prompts may not describe this project's market, and do not
lead with the map.

---

## 14. Verify what a research tool tells you

Any URL or figure that comes from a web-research tool rather than from CompetLab is a claim, not a
fact. Before it reaches a person:

- Fetch the URL with `mcp__competlab__fetch_url` (`cleanHtml: true`) and confirm the page exists and
  supports the claim.
- Drop what does not verify. Do not soften it into a hedge — remove it.
- **A claimed MCP server needs a JSON-RPC POST, not a browser GET.** A 200 on GET proves a web server
  answered, not that an MCP server exists.

---

## Quick self-check before you write

1. Is every count paired with its universe?
2. Did I turn a small-N count into a percentage?
3. Did I pool anything across engines?
4. Did I order two brands whose ranges overlap, or call a difference a movement?
5. Did I treat a `null` as a zero, or an unreadable page as an absence?
6. Did I check the sign on `mentionRateGap`?
7. Did I say "cited" where I meant "retrieved"?
8. Did I pass `actionHint.text` and `limits.sentences` through verbatim?
9. Did I present model prose as fact?
10. Did I lead with a score instead of membership?
