# TEMPLATE — L3 CMO Briefing (main doc, the one CMO reads first)

**Filename convention:** `briefing.md` at the root of each `cmo-reports/{project-slug}-{date}/` folder.
**Target length:** 200-250 lines / 8-10k words. Tighter than a comprehensive data-dump; deeper than a tactical update.
**Audience:** CMO with 15 min to read. Every paragraph earns its place via implication, not just description.

---

## Required structure

### Header block

```
# [Brand Name] — Strategic CMO Briefing
> Prepared {date} | Cold-start analysis | Sources: CompetLab CI ([N]-week monitoring history, [M]-day AI Visibility trend) + 8-skill on-demand research
> Data freshness: ✓ all dimensions ran within 24h  /  ⚠ some within 7d  /  ✗ older

> *Backing layers* (navigable in app, available as files in this folder):
> *Per dimension: [dim-landscape] · [dim-ai-visibility] · [dim-funding-capital] · [dim-hiring-gtm] · [dim-product-launches] · [dim-agent-adoption] · [dim-reliability-status] · [dim-customer-voice]*
> *Per competitor: [comp-{a}] · [comp-{b}] · [comp-{c}] · [comp-{d}] · [comp-{e}]*
```

The data-freshness traffic-light at the top is mandatory. CMO needs to know which findings are weight-bearing.

### Section 1 — Strategic Thesis (read this first)

One paragraph compressed thesis. The "two-simultaneously-true" framing works when warranted ("X is unusually strong in dimension A AND structurally exposed in dimension B").

**Keep the thesis paragraph under 90 words** (banked from real-world validation). A CMO scanning on a phone gets a wall of text otherwise. Split a longer thesis into 2-3 shorter sentences keeping the same content (claim → evidence → category-validation).

Then a short list under "Where [brand] is unusually strong" + a short list under "Where [brand] is structurally exposed". 3-5 bullets each, each with one concrete data point.

**Pair thin-data caveats with the claim where the claim appears** (banked from real-world validation). If you call AI Visibility a "negative trend" in this section's exposure list, name the sample-size caveat (e.g., "n=9 per check; ≤11pp movements within noise") INLINE — not in Section 8 ("What this briefing didn't cover"). Otherwise the front-of-doc alarming-framing is divorced from the back-of-doc honest-uncertainty, which is performative confidence. Same rule applies to any directional read from <3 data points: name it where you name it.

**Don't double-count.** If a vendor-self-reported metric (G2 rating, vendor's own reviews count) is the basis for a "strength" bullet, mark it `(self-reported)` inline. Otherwise the same data point can read as both strength (Section 1) and structural gap (Section 8) without a CMO noticing the inversion.

End with: "**The strategic question this briefing poses:**" — one paragraph naming the choice the CMO has to make.

### Section 2 — Where the market is going (1-3 macro shifts the CMO needs to internalize, depending on data density)

Each macro shift gets a third-level heading + 1-3 paragraphs. Backed by concrete data (funding amounts with provenance, analyst-quoted dollar figures, dated industry events). Drawn from `dim-landscape.md` + Perplexity research synthesized through `competlab-landscape`.

**Number of shifts depends on data density:** for enterprise B2B SaaS categories with rich funding + hiring + product data, 2-3 shifts works well. For bootstrapped-indie categories (hospitality, vacation rental, solo-founder AI tools) where funding + hiring + customer-voice return categorical absences, 1-2 shifts is honest — don't pad. **Banked from real-world validation runs.**

**Density signal for picking shift count** (banked from real-world validation): count the distinct multi-dimensional convergence-stories visible in the dim docs. A "macro shift" requires ≥3-dimension data backing it (not a single positioning alert). If only 1 multi-dimensional shift surfaces in the dim docs, ship 1-2 macro shifts (the second can be a "category-wide pattern" shift rather than a single-vendor story). If 3+ multi-dimensional shifts surface, ship 3 — don't drop signal. For mid-density categories (2 distinct shifts), ship 2.

End each shift with "**Implication for [brand]:**" — one short paragraph naming the specific consequence.

### Section 3 — Where [brand] sits today (honest mirror, dimension by dimension)

Concise per-dimension reads. Each dimension subsection: 1 paragraph reading the data + 1 line "strategic interpretation". DON'T re-paste every chart — reference the L2 dimension doc for evidence.

**Mandatory for any competitor where ≥5 dimensions converge on a single strategic story in a same-window pattern** (banked from real-world validation):

> "[Competitor X] is executing a coordinated [direction] across [N] dimensions in the same [timeframe] window: [dim 1 evidence] + [dim 2 evidence] + [dim 3 evidence] + [dim 4 evidence] + [dim 5 evidence]. See [comp-{x}.md] for full evidence trail. Strategic read: [what this means for the user's brand]."

**Decision logic:**
- **If only one competitor passes the ≥5-dim convergence bar → ship one convergence paragraph.** Don't force a weaker second one to hit "1-2" count.
- **If two pass → ship two.** Each gets its own paragraph; don't mash together.
- **If none pass → omit this section entirely and explicitly note** "no multi-dimensional convergence patterns surfaced in this run — competitor moves appear isolated rather than coordinated."

This is the canonical shape that proves the multi-dimensional skill coverage is worth shipping. The quality bar is the convergence-count, NOT a target paragraph-count.

**Same-window coherence qualifier** (banked from real-world validation): the ≤60-day window between earliest and latest signal is the implicit qualifier on the ≥5-dim convergence rule. A competitor showing 5 dimensions of activity spread over 18+ months is NOT a same-window pattern — that's just operational history. A competitor showing 5 dimensions of coordinated activity in a 30-60 day window IS the canonical convergence paragraph shape (rebrand + product launch + hiring surge + MCP-server ship + analyst-validation all in same quarter). If the candidate's signals are dispersed across 6+ months OR partly accidental (e.g., auto-generated llms.txt, brand-absorbed parent activity, CEO transition that happened earlier), the convergence is descriptive not strategic — don't write a convergence paragraph for it.

### Section 4 — Three strategic paths to consider

Three paths, A / B / C. Each gets a heading + a strategic-claim quote ("Defend the freemium-leader beachhead" / "Build the on-ramp" / "First-mover on agent monitoring"). Then 4 short paragraphs: **Why it works** / **Why it might not be enough** / **What it costs** / **Best for** (or **Resource fit**).

End with **"Recommended combination"** — a one-paragraph synthesis of which paths run when (e.g., "A as deployable base, C as parallel bet, B as deferred decision 60-90 days"). **Mandatory** — the combination IS the actionable extraction.

**Re-condition the combination on any Decision Question whose answer materially flips the recipe** (banked from real-world validation). If Q3 asks "what's your current dev capacity?" and the answer determines whether Path C ships as full agent-economy infrastructure OR as a lite robots.txt + llms.txt subset, the Recommended combination paragraph MUST name the conditional explicitly: "Path A + full Path C if you have 2 dedicated dev-weeks for the MCP-server build; Path A + lite-Path-C (robots.txt + llms.txt + Schema.org only) if dev capacity is constrained — full MCP work defers to next quarter." Otherwise a CMO who answers the question doesn't know how the recipe adjusts.

### Section 5 — Prioritized recommendations

5-8 recommendations grouped by horizon: Within 7 days / Within 14 days / Within 30 days / Within 90 days.

Each recommendation: bold title + What / Why now / Effort / Impact lines. Cite specific CompetLab evidence or market research for each. **No generic "ship more comparison pages" templates** — use the narrative-recommendation pattern (state thesis + causal story + concrete actions; not template-fill).

**If the 30-day list has more than 5 items, add an "If you only do 3" callout for the 30-day horizon** (banked from real-world validation). The 7-day horizon already has a dedicated cheapest-high-leverage sidebar (Section 6). The 30-day horizon needs the equivalent — overpacked 30-day lists pattern-match as "lots to do" rather than "here's the strategic top-3." Sidebar shape: name 3 specific items + 1-line rationale per pick ("Why these 3 vs the other N: these compound across Path A + Path C; the others are quality-of-life improvements"). Don't auto-pick the highest-effort 3 — pick by leverage-per-week.

**If the 90-day list is thinner than the 30-day list** (e.g., 3 items vs 8), revisit whether some 30-day items actually belong in 90-day. Better to have a credible 90-day arc than a stuffed 30-day list with a leftover-feeling 90-day list.

### Section 6 — Cheapest high-leverage move (callout sidebar)

A boxed paragraph in the briefing, named explicitly. Often surfaces from the per-dimension findings — a small fix with disproportionate impact (e.g., "ship a status page", "fix the status-page subdomain CNAME"). **Mandatory if one exists in the dimension docs.**

**Justify why THIS specific 1-day fix wins the slot vs other 1-day moves in the 7-day list** (banked from real-world validation). The 7-day list typically contains several sub-1-hour moves (security headers, robots.txt corrections, llms.txt creation, status page subdomain, Schema.org markup). Reader can't tell whether the sidebar pick is THE cheapest-leverage move or just the first-thing-the-skill-thought-of. Sidebar must briefly acknowledge competing candidates: "robots.txt is also a 1-hour move; security headers wins the sidebar because the cascade into procurement-trust + AI-training-signal is stronger than the cascade from robots.txt alone." One sentence is enough. Without it, the sidebar reads as random selection.

### Section 7 — Monitoring Suggestions

Cheap-recon findings on AI-visible-unmonitored brands. For each of the top-3 candidates:

> "**Brand Y** (not currently monitored): AI Visibility Score [N] in your category, [funding event], [product event], [ecosystem event]. **Consider adding** — this is the competitor you didn't know to watch."
>
> "**Brand Z** (currently monitored): AI Visibility Score [N], no significant activity across cheap-recon dimensions. **Consider removing** if monitoring slot is constrained."

Brief. The reasoning is in the data; the CMO either acts on it or doesn't. Plus a one-sentence link to the GUI: "Adjust monitored set in project settings."

**Customer-natural framing for promotion decisions** (banked from real-world validation): when surfacing an auto-promoted candidate's qualifications, use plain language naming the specific reasons, NOT internal-criteria-math. Customer-natural: *"Verified MCP server + cross-LLM consistency + named-in-briefing + structural blind spot — warrants deep-dive coverage."* Internal-vocabulary (avoid in customer text): *"Auto-promoted to FULL comp-doc per Phase 5.6 criteria (4/4: ...)."* The criteria-math is your decision tool; the customer reads the conclusion in their language.

### Section 8 — What this briefing didn't cover (acknowledged gaps)

Short list of **business-level scope choices** — what's outside the surface this briefing analyzes, so the CMO knows where to bring their own data + sales-team knowledge to complete the picture.

Examples of what belongs here:
- Sales motion data (internal — win/loss, pipeline, sales-cycle length)
- Customer cohort behavior (internal — free-to-paid conversion, churn drivers, retention curves)
- Pricing elasticity (would need revenue-by-tier disclosure)
- Brand-equity quantification (NPS, share-of-voice in private channels)
- Regional / international expansion analysis (depends on geo-segmented revenue data)
- Customer interview synthesis (qualitative research outside scope of competitive monitoring)

This section answers "what would I bring to complement this briefing?" — it's a scope honesty note, not a tool-quality report. Keep it focused on **what kind of data lives outside competitive-intelligence-from-public-surfaces** so the CMO can plan accordingly.

### Section 9 — Decision Questions

3-5 questions whose answers would **materially change** recommendations. Tied to identified strategic ambiguities (Path A vs B vs C choice points, brand-voice tradeoffs, risk tolerance reads). NOT generic clarifications.

Each question maps to a recommendation that flips entirely based on the answer.

**Question framing (banked from real-world validation):** Decision Questions can either be **pure-clarifying** (state question; both branches of recommendation depend on answer) OR **conditional-prescription** (state both branches of recommendation explicitly — "if Y → do X, if Z → do W"). **Default to conditional-prescription where data permits.** Conditional-prescription is more actionable; pure-clarifying is more honest when the strategic context isn't visible from the data. The pattern is: don't just ask "Does customer want enterprise tier?" — ask AND name the if/then branches: "If yes → execute Path B (24mo enterprise build); if no → consolidate on Path A defense + Path C parallel."

**The bar for inclusion: each question's answer must materially flip a specific recommendation.** Generic clarifying questions ("what's your strategy?") don't earn the slot. Questions that ALREADY have a defensible default ("Should you run a G2 review-collection program?" — when both branches lead to "yes, focus on Path C" anyway) are below the bar — they're informational, not recommendation-altering. If a question doesn't change the recommendation matrix in any branch, cut it.

**Self-contained shareability:** write this section so the CMO can copy-paste it into an email to their head-of-strategy / leadership team without re-explaining context. Each question reads as a standalone "decision we need to make and why it matters" — not as a callback to the briefing body. The section's job is to be the forwarding artifact for delegation.

### Footer

```
*This briefing is the synthesis. See backing per-dimension and per-competitor docs in this folder for full evidence trails.*
*Prepared from CompetLab competitive monitoring + on-demand market research across 12 dimensions, {N} competitors covered.*
```

The footer mentions data sources at the category level only. Don't list working files, verification logs, or per-dimension freshness breakdowns from internal scaffolding in the footer — those don't belong in the customer's view.

---

## What to AVOID

- Don't re-paste every data point — reference L2 docs for evidence
- Don't write a 14k-word essay — 200-250 lines target, expand only when warranted
- Don't write "intel / asset / deliverable / deploy" — plain English
- Don't perform either confidence or doubt — name what's actually there
- Don't write template-driven recommendations — narrative shape only
- Don't include unverified Perplexity citations — they must clear `PATTERN-url-verification.md` before reaching this doc
