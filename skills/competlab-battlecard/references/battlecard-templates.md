# Battlecard templates

> Reference for the competlab-battlecard skill. Format options, and the phrasing that survives the
> follow-up question.

Every slot below is filled from a field the platform actually returns. Where a figure appears in an
example it is either `{in braces}` — fill it from a run — or marked *illustrative*, which means it
shows the shape of a sentence and never reaches a card as written.

That is the whole discipline this file teaches. **An unsourced number on a call is a liability, not
ammunition.** The prospect's next question is *out of what?*, and a rep who cannot answer it has spent
their credibility on one line. So every figure on the card is a count with its universe and the date
of the run that produced it — `references/reading-the-data.md` §2 is the rule, and a call is where it
costs the most to break.

---

## Format options

### Standard — one rival, one page

The default, and the structure in the skill's Output section. Use it unless more than one competitor
is live in the same deal.

### Multi-competitor matrix

For a deal with three or four rivals in play at once. Every row below is one field from one run.

```markdown
# {Our brand} vs the field — {category}
> Pricing run {date} · Positioning run {date} · Tech & trust run {date}

| | {Our brand} | {Rival A} | {Rival B} | {Rival C} |
|---|---|---|---|---|
| **Entry price** | | | | |
| **Billing model** | | | | |
| **Free tier** | | | | |
| **Who they say they sell to** | | | | |
| **Their headline claim** | | | | |
| **Trust signals found** | | | | |
| **Security headers found** | | | | |
| **Content categories published** | | | | |

**Against {Rival A}:** {1–2 talking points}
**Against {Rival B}:** {1–2 talking points}
**Against {Rival C}:** {1–2 talking points}
```

Three rules for filling a cell:

- **A cell is a measured value, or it says why it is not.** Write "the scan could not read this page",
  never an empty cell and never a dash — in a matrix, blank reads as *they do not have it*, which is
  the exact claim a `null` does not support.
- **Trust signals and security headers are counts with their universe** — "{n} of the {N} the scan
  checks" — because a bare number invites the reader to treat it as a grade. There is no grade.
- **"Who they say they sell to" and "their headline claim" are their words**, quoted from the
  positioning run. That is what the prospect already read on the homepage, not our reading of it.

**There is no AI Visibility row, deliberately.** No per-brand AI Visibility value fits in one cell: a
score is a blended figure the rep cannot defend, a rate is a share off a question set that is small by
design, and a position is a figure the platform does not publish at all. Membership goes under the
matrix instead, per engine and in counts — *"Of the {N} answers {engine} gave on {date}, {Rival A} was
named in {n} and we were named in {n}"* — and where two brands' ranges overlap, say tied.

### Persona emphasis

Same card, different order. Lead with the surfaces that buyer actually evaluates:

- **Technical buyer** — tech stack and security headers from the tech & trust run, AI crawler access,
  and what the sitemap does and does not expose.
- **Economic buyer** — plans, billing model and free tier from the pricing run, set against the
  audience and differentiator the rival claims in positioning.
- **Executive buyer** — membership: which companies the models name in this category, and whether we
  and the rival are among them. Per engine, in counts, with the date.

Re-ordering is all this is. Nothing is added for a persona that was not measured for the card.

---

## Objection handling

Three beats, in order. Acknowledge, evidence, redirect.

1. **Acknowledge** — grant the part that is true. Denying something the prospect has already seen ends
   the conversation, not the objection.
2. **Evidence** — one measurement, with its universe and its run date.
3. **Redirect** — a question that moves to ground where the measurement favours us.

Shape, *illustrative* — every figure here is a slot, and none of these numbers exist:

> **Objection:** "{Competitor} is cheaper."
>
> **Response:** "They are — their entry plan is {their entry price} against our {our entry price}, as
> of the pricing run on {date}. **[Acknowledge]** Where it runs the other way is the trust scan on
> {date}: it found {n} of the {N} signals it checks on their homepage, and {n} of {N} on ours.
> **[Evidence]** Whether that matters depends on who signs this off — does it go through a security
> review? **[Redirect]**"

Two failures to watch for, both easy and both fatal on a call:

- **Inventing the evidence beat.** A plausible-sounding statistic is the simplest thing in the world
  to write into an objection response, and the fastest way to lose a room. If no run measured it, the
  objection gets an honest answer without a number — or it does not go on the card.
- **A `null` dressed as a finding.** "They have no free plan" and "the pricing scan could not read
  their page" are different sentences. Only one of them is safe to say out loud.

---

## Killer facts

A killer fact is the one line a prospect still has after the call. Four tests:

1. **Verifiable** — they can check it themselves, today, without asking us.
2. **Surprising** — not something a demo would have shown them.
3. **Relevant** — it touches how they will actually use the thing.
4. **Memorable** — one sentence, one number, one universe.

Worked through:

- ❌ "We're the better product." Vague, and nothing to check.
- ❌ "They score badly on security." There is no score. The scan returns which headers and signals it
  found, and that is what the rep gets to say.
- ❌ "They're mentioned {x}% of the time." A share off a question set that is small by design. The
  prospect asks *out of what?*, and the answer is embarrassing.
- ✅ *illustrative* — "The trust scan on {date} found {n} of the {N} signals it checks on their
  homepage, and {n} on ours. Both pages are public — you can look while we talk."
- ✅ *illustrative* — "Across the {n} pages {engine} retrieved on {date} while answering {the buying
  question}, they are named on {n} and we are named on {n}."

The second one is the strongest kind available: retrieved pages, one engine, both counts carrying the
same universe. Say **retrieved**, never *cited* — the engines do not disclose which pages they leaned
on, so a rep who says "cited" has quoted a number the engines never published.

---

## Landmine questions

A landmine is a question the rep hands the prospect to ask the other vendor. It works when it is real,
checkable, and sounds like help rather than an attack — *"have you asked them about…"*, never *"did
you know they don't…"*. If the gap is not in a run, there is no landmine: a wrong one hands the deal
to the rival.

| Anchored in | Shape |
|---|---|
| Content run — a category they do not publish | "Ask them for {content category the run shows is absent}. It is what you will need in month two." |
| Pricing run — a plan or add-on the page does not state | "Ask what {plan or add-on} costs. It is not on their pricing page." |
| Tech & trust run — a signal the scan did not find | "Ask which of {the signals} they publish, and where. Ours are on {page}." |
| Tech & trust run — crawler access | "Ask whether their docs are readable by {crawler}. It decides whether your own AI tooling can see them." |
| Any surface — data ownership | "Ask what happens to your data if you leave, and whether the export is self-serve." |

The last row is the one that needs no measurement behind it — it asks about their contract, not about
a claim we have made. Every other row needs a run, a date and a field.
