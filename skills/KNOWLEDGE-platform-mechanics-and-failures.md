# Knowledge — Platform Mechanics + Signal-Extraction From Partial Data

> **Audience:** this doc is your private orchestrator-internal reasoning. It informs how you make decisions. It does NOT shape what your customer-visible deliverables look like — those carry the strategic finding, not the reasoning chain.
>
> **Your orientation:** your customer's competitive intelligence foundation is CompetLab's 5-dimension monitoring + continuous AI Visibility tracking — structured, hard-to-replicate signal across positioning, pricing, content, tech-trust, and AI-discoverability surfaces. Your job: extract maximum strategic value from that foundation, extending with web research where it adds depth, and deliver a CMO-grade briefing the customer can act on Monday.
>
> **Real-world competitive surfaces are always partial.** Some vendors bot-protect their site. Some categories don't surface on G2. Some pages JS-render their pricing. When data on a dimension is partial, that partiality is itself competitive signal: a vendor invisible to your scan is also invisible to AI training crawlers, comparison-engine bots, and agent toolkits — material AI Visibility consequence for them, opportunity for the customer to surface where they're differently positioned. **Use the partiality. Extract the strategic finding. Verify via alternative channels where it adds confidence. Ship the value.**

---

## The core principle

**Every CompetLab dimension check is a proxy for "can an automated system extract this signal from your site."** When a check fails, the customer's signal is invisible to OTHER automated systems too — AI Viz training data, comparison-engine crawlers, agent toolkits making procurement decisions, SEO bots indexing the page.

**Failed scan ≠ "no data exists." Failed scan = "this data is invisible to automation."**

That distinction is the single most strategic insight skills can produce, and it's the one the orchestrator must explicitly surface.

---

## Per-dimension mechanics + failure modes

### 1. Sitemap (foundational — most cascades root here)

**How it works.** CompetLab fetches the customer's robots.txt for sitemap directive. Falls back to `/sitemap.xml`. Parses XML. Recurses into sitemap-index children (depth 2 max). Extracts URL list. Categorizes URLs (blog / docs / tools / landing / legal / case-studies / comparison / integrations / changelog / webinars / pricing).

**Failure modes:**
- **Sitemap fetch fails** (403/404/timeout) → entire downstream URL-discovery chain breaks
- **Sitemap parses but returns empty** → no URLs to feed downstream dimensions
- **Sitemap has `<urlset>` but wrapped in HTML viewer** (Chrome XML viewer-style) → parse fails on HTML-wrapped XML
- **Sitemap is gzip-compressed (`.xml.gz`)** → some parsers don't handle gzip
- **Sitemap index has child URLs at different hosts** (apex vs www) → child URLs filtered out by host-match logic
- **Single sitemap returned successfully but only contains placeholder URL** (the discovery returns the parent URL as the only entry when fetch silently fails — common silent-failure pattern)

**Cascades to other dimensions:**
- **Content dimension** — completely broken (no URL list to categorize)
- **Pricing dimension** — pricing-page URL can't be auto-discovered; project config has to be hand-edited to set pricing URL
- **Positioning dimension** — usually still works because it fetches homepage directly, not via sitemap
- **AI Visibility** — unaffected (independent dimension, queries LLMs not customer's site)
- **Tech & Trust** — unaffected (fetches homepage + robots.txt directly)

**What to surface in briefing when a customer's own sitemap fails:**
> "Your sitemap at `{url}` couldn't be parsed (reason: {bot-protection / 404 / malformed XML / etc.}). The cascade: pricing-page auto-discovery fails → pricing dimension is skipped entirely for your domain → no pricing history, no pricing alerts. **High-impact fix in 1 day:** add a working sitemap.xml at the canonical location, OR manually configure pricing URL in CompetLab project settings (Competitors card → edit). Material AI Viz consequence: comparison-pricing queries from OpenAI/Claude/Gemini can't extract your prices either, ceding pricing-discovery to competitors whose sitemaps work."

**Real-world pattern:** in one validation run, 4 of 41 monitored competitors had sitemap-fetch silent failures storing placeholder URLs (variety of failure modes: 403 bot-protection, HTML-as-XML parse error, 404 missing sitemap). Each cascaded into per-domain pricing/content skip — pattern: bot-protected sitemap → all downstream URL-discovery breaks → per-vendor monitoring degrades silently.

---

### 2. Pricing dimension (most fragile — iframe, JS-render, gated content all break it)

**How it works.** CompetLab fetches the pricing URL (from `competitor.monitoredPages.pricing.url` — auto-discovered from sitemap OR manually set in project config). Parses HTML for structured pricing markers (plan tables, price elements, billing toggles, free-trial buttons, enterprise CTAs). Extracts: `plans[]` (name + price + interval + features), `popularPlanName`, `popularPlanPrice`, `pricingModel`, `hasFreePlan`, `hasFreeTrial`, `freeTrialDuration`, `hasEnterpriseCustomPricing`, `enterprisePlanCTA`.

**Failure modes:**
- **Pricing-page URL unknown** (sitemap-cascade — see above) → check skipped entirely, returns `null` for all fields
- **Pricing content is in an iframe** → scanner sees iframe wrapper but can't enter the iframe's content document → returns `pricingModel: null, plans: []` despite the customer site clearly showing prices to humans
- **Pricing content is JS-rendered after page load** → server-rendered HTML has no price data; scanner extracts empty
- **Pricing-page is bot-protected** (Cloudflare challenge / DataDome / etc.) → scanner returns 403 or HTML-disguised-as-content
- **Pricing-page returns HTML for what should be a structured page** (server-side redirects to landing page) — see Sequenzy-style category-confusion
- **Pricing is behind auth gate** (login required) → 401/403 + login form HTML
- **Pricing is on a different domain than monitored** (e.g., parent company hosting) — same as cross-brand pricing-link gotcha (Anthropic footer → claude.com)

**Cascade to other dimensions:**
- **Positioning dimension** — usually still has partial pricing signals (`pricingMentioned: true`, `startingPrice` parsed from homepage CTA copy). **THIS IS WHERE THE DISCREPANCY SURFACES.**
- **AI Visibility** — LLMs can still mention the brand but can't cite prices in comparison queries
- **Action plan** — generates "no enterprise tier" / "no free trial visible" recommendations that may be wrong (the customer might have both, just unscrapeable)

**What to surface in briefing when customer's pricing dimension returns null:**

> "Your pricing page at `{url}` returns no parseable pricing data (positioning dimension confirms pricing signals exist on your homepage — `pricingMentioned: true`, `hasFreeTrial: true`, `startingPrice: $X`). The pricing dimension shows null. **The discrepancy is itself the finding:** the pricing data IS on your site for humans but invisible to scrapers/agents/AI training crawlers.
>
> Material AI Viz consequence: when OpenAI/Claude/Gemini receive pricing-comparison queries in your category, they can extract competitors' prices but not yours. You're ceding pricing-leadership-narrative to competitors who structure their pricing as parseable HTML.
>
> **1-2 day fix:** add a static HTML `<table>` of plan name + price + billing interval + features, alongside any interactive widget. Common causes that produce this failure shape: iframe-embedded pricing widget, JS-rendered pricing after page load, bot-protected pricing path, dynamic personalized pricing requiring a logged-in session. **If your pricing-presentation is intentionally not-parseable (e.g., enterprise-only with mandatory sales conversation), surface that explicitly in the page's static HTML so scrapers report 'custom-quote-only' rather than null.**"

**Real-world pattern:** customer's pricing page renders pricing data in an iframe. The pricing-dashboard scan returns `plans: []`. The positioning-dashboard scan picks up `startingPrice: "$X Per Unit"` from the homepage CTA. The discrepancy proves: pricing exists but is iframe-embedded. AI Viz comparison-pricing queries can't extract these prices. Action: extract pricing from iframe into a static `<table>` on the pricing page. 1-day fix; permanent AI-discoverability gain.

---

### 3. Content dimension (depends entirely on sitemap working)

**How it works.** Reads URL list from sitemap (sitemap dimension is upstream dependency). Categorizes URLs into 11 buckets (blog, docs, tools, landing, legal, case-studies, comparison, integrations, changelog, webinars, other). Computes `strategicUrls` count (sum excluding legal + other). Compares against competitor averages. Generates content-gap recommendations.

**Failure modes:**
- **Sitemap broken** → returns 0 strategic URLs (cascade from sitemap)
- **Sitemap exists but only main-domain content** while customer's docs live on subdomain (`help.{customer}.com`, `docs.{customer}.com`) → undercounts docs dimension
- **URL categorization heuristic misclassifies** vendor-specific URL patterns (e.g., `/editorial/...` may not match blog regex even though it's blog content)
- **Sitemap returns enormous URL set** that triggers truncation (>50 sitemap URLs, depth-2 cap)

**Cascade:**
- **Action plan** generates "0 blog posts" / "no docs" / "no comparison pages" recommendations
- **AI Visibility** — directly correlated with content volume in many categories; broken sitemap = artificially-suppressed perceived content footprint

**What to surface in briefing when customer has subdomain content not in main sitemap:**

> "Content dimension shows 0 docs / 0 changelog / 0 X for your domain. Cross-checked via direct probe: your docs actually live at `help.{customer}.com` (or `docs.{customer}.com`). The main-domain sitemap doesn't reference the subdomain. **The cascade matters:** AI training data + SEO crawlers + agent toolkits ALSO don't surface your subdomain content from main-domain crawls. **1-week fix:** add `/docs/` namespace on main domain mirroring subdomain, OR add subdomain sitemap link to main robots.txt + cross-link from main-domain pages."

**Real-world pattern:** Content dimension shows "0 docs" for a customer despite an extensive knowledge base at `help.{domain}` subdomain. Strategic recommendation: cross-link help subdomain from main-domain pages so sitemap surfaces the docs content.

---

### 4. Positioning dimension (mostly works — locale-redirect is the failure mode)

**How it works.** Fetches customer homepage via CompetLab `fetch_url`. Extracts: pageTitle, pageDescription, mainHeadline, tagline, valueProposition, primaryCTA, secondaryCTA, keyOfferings, targetAudience, mainDifferentiator, pricingMentioned, hasFreeTrial. Computes messaging-strength score (proprietary). Generates positioning-gap recommendations against competitors.

**Failure modes:**
- **Locale-redirect captures wrong-language version** (CompetLab fetch_url egresses from EU → sites with IP-based geo-detection serve EU locale by default → English content is invisible).
- **Homepage is JS-rendered** (Next.js SSR with hydration mismatch, or pure SPA) → server-rendered HTML has placeholder content
- **Cookie wall / GDPR consent gate** → scanner gets the consent banner, not the actual content
- **Bot-protected homepage** → returns 403 or challenge page

**Cascade:**
- **AI Visibility action plan** — surfaces "GAP: missing AI/automation in messaging" when actually the right-language version DOES have AI messaging (scan-artifact)
- **Strategic recommendations downstream** — based on wrong-language headline / wrong-locale messaging

**What to surface in briefing when locale-redirect detected:**

> "Positioning dimension captured `{detected-locale}` content for your site. The German/French/etc. content shows `{X}`. Your English homepage actually shows `{Y}` (verified via direct fetch with English Accept-Language header). The dashboard insight about missing-AI-framing is partially scan-artifact — your English nav does have AI feature pages (`{list}`), they're just not in the captured German render. **Strategic-level read holds:** your masthead leads with `{outcome-framing}` not `{AI-framing}`, which IS true across locales — but the dashboard's specific gap-recommendation framing should be interpreted with the locale caveat. The reverse-direction recommendation (move AI framing above the masthead in BOTH locales) is sound."

---

### 5. Tech & Trust dimension (security + trust signals + tech stack)

**How it works.** Three sub-checks combined:
- **Security headers** — direct probe of customer's homepage; checks HSTS, CSP, X-Frame-Options, X-Content-Type-Options; assigns letter grade
- **Trust signals** — parses homepage HTML for trust markers (compliance badges, review platform logos, customer logos, certifications, social proof) — 24 signals in 4 categories
- **Technology stack** — uses 47+ detection rules to identify hosting, frameworks, CMS, analytics, marketing tools

**Failure modes:**
- **Homepage bot-protected** → all 3 sub-checks fail or return partial data
- **Trust signals false-negative** — vendor has ISO27001 badge but it's in a footer image rather than declared structured data → signal undetected
- **Tech-stack misdetection** — some stacks (e.g., Astro + minimal deps) have low detection-rule match → reported as light-stack even when production-mature

**Cascade:**
- **Action plan** — surfaces "0 compliance signals" for vendor that actually has them (false negative)
- **Customer briefing** — could miss the strongest positioning angle

**What to surface when trust signal false-negative suspected:**

> "Tech & Trust dimension reports 0 compliance signals for your domain. Manual check shows you have `{ISO27001 / SOC2 / NIST / etc.}` badges in footer. The detection may have missed them because they're rendered as `<img>` tags without structured-data context. **Strategic-level read:** the compliance assets exist — the gap is that they're not in machine-readable HTML. Cheapest move: add `aggregateRating` + `creator` Schema.org structured data tagging compliance certifications. Visible immediately to CompetLab + AI training crawlers + procurement tools."

---

### 6. AI Visibility dimension (independent — has its own failure modes)

**How it works.** Sends 3 prompts × 3 LLM providers (OpenAI, Claude, Gemini) = 9 queries per check. Parses each LLM response for brand mentions, computes mention rate, average rank, per-provider breakdown. Aggregates to AI Score (0-100). Tracks competitor rankings + AI Analysis insights.

**Failure modes:**
- **Small sample size noise** (n=9 per check) — single-week swings can be sample noise, not signal
- **Category-semantic widening** — LLMs categorize "X retention automation" to include adjacent categories (email marketing tools, etc.) — Sequenzy-style finding
- **Customer-brand absent from top-N** — could mean (a) genuinely not surfaced, (b) surfaced but rank > 10 cutoff, (c) sample didn't include the right query phrasing

**Cascade:**
- This dimension has FEW cascades because it's mostly self-contained
- BUT — it's the dimension most affected by OTHER dimension failures (broken sitemap → less content → lower AI Viz; broken pricing → can't be cited in comparison queries → lower mention rate; broken locale → wrong-language signal in AI training data)

**What to surface:** AI Viz declines in customer's project rarely cause customer-direct action — they signal that OTHER dimensions are degrading content discoverability. Treat AI Viz as the downstream-symptom dimension, sitemap/pricing/positioning/content as the upstream-cause dimensions.

---

### 7. Agent-Adoption dimension (the 25-check Agent-Adoption Spec)

**How it works.** CompetLab's `start_agent_adoption_scan(domain)` runs 25 checks across 4 categories — Discoverability, Access Control, Content Readability, Agent Endpoints. Returns per-check pass/fail + overall score 0-100. Detects MCP server URLs, llms.txt, .well-known/mcp, sitemap depth, robots.txt openness, AI-bot-specific directives, content-type negotiation, SSR vs CSR rendering, structured-data presence.

**Failure modes:**
- **`check_ai_crawlers` path-scope mis-parse** — reports "blocks all AI bots" for path-scoped wildcards (known cross-tool disagreement; reconcile via Phase 5.5)
- **MCP candidate URL detected but never JSON-RPC-verified** — `start_agent_adoption_scan` flags an MCP-candidate URL but the existence-check is browser-GET not JSON-RPC POST; can produce false-positive MCP claims. Mitigated by `competlab-agent-adoption` skill's Steps M1-M3 verification per `PATTERN-url-verification.md`.
- **CSR-rendering caps the score** — sites with heavy client-side rendering get capped at score 59 even with perfect everything-else (because non-JS agents can't extract content)
- **`noViablePathCap: 39`** — sites with no llms.txt + no .md URLs + no Accept: text/markdown content negotiation are capped at 39 regardless of everything else

**Cascade:**
- This dimension is rich because it touches many sub-signals
- Drives the briefing's agent-readiness recommendations
- Currently zero CompetLab dimension consumes its output downstream (agent-adoption is the dimension; nothing else uses its data)

**What to surface:** if score is capped (e.g., 39 max because no llms.txt), surface the SPECIFIC cap-cause as the cheapest-high-leverage move ("Ship llms.txt in 7 days, lifts score from 31 capped at 39 to ~50+").

---

## Cross-dimension cascade map (the dependency diagram)

```
                  ┌──────────────┐
                  │   Sitemap    │  ← root cause for downstream URL-discovery
                  └──────┬───────┘
                         │ (URL list)
        ┌────────────────┼────────────────────┐
        ▼                ▼                    ▼
  ┌──────────┐   ┌──────────────┐    ┌───────────────┐
  │ Content  │   │   Pricing    │    │  (others)     │
  │ (broken  │   │  (skipped if │    │   monitored   │
  │  if SM   │   │  pricing URL │    │   pages       │
  │  broken) │   │  not in SM)  │    │               │
  └──────────┘   └──────┬───────┘    └───────────────┘
                        │
                        │ if returns null
                        ▼
                   compare to Positioning dimension
                   (does positioning say pricing exists?)
                        │
                  ┌─────┴─────┐
                  │            │
                  yes          no
                  │            │
                  │            └── pricing genuinely absent → confirms scan
                  │
                  └── pricing exists but unscrapeable → SURFACE AS STRATEGIC FINDING
                      ("invisible to AI/scrapers/agents — material AI Viz consequence")

                  ┌──────────────────────┐
                  │   Positioning         │  ← independent fetch (not via SM)
                  └──────────┬───────────┘
                             │
                             │ failure mode: locale-redirect
                             ▼
                       (capture wrong-language)
                             │
                             └── Cross-check finalUrl vs requested URL
                                 If different language segment detected,
                                 reconstruct from canonical fetch

                  ┌──────────────────────┐
                  │   Tech & Trust        │  ← independent (homepage + robots.txt)
                  └──────────┬───────────┘
                             │
                             │ failure mode: bot-protection
                             ▼
                       (security grade + trust signals miss data)

                  ┌──────────────────────┐
                  │   AI Visibility       │  ← INDEPENDENT dimension (queries LLMs, not customer)
                  └──────────┬───────────┘
                             │
                             │ but downstream-symptom of other failures
                             ▼
                       (declining AI Viz often signals
                       upstream content/pricing/positioning degradation)
```

---

## Decision logic for the orchestrator

**When ANY scan returns null/empty/error for the customer's own site (vs successfully scanning competitors):**

1. **Cross-check with sibling dimensions.** Does the sibling dimension show this data should exist?
   - E.g., positioning shows `pricingMentioned: true, startingPrice: "$X"` → pricing dimension's null IS the signal
2. **If sibling confirms data exists** → mark as **parseability gap** (not no-data gap). Surface as strategic finding per templates above.
3. **If sibling also shows no data** → likely genuine absence. Note in caveats; don't fabricate a strategic finding.

**When ANY scan returns null/empty/error for a competitor's site:**

1. Note in dim doc, don't pad with "no data" cells (per categorical-absence pattern in TEMPLATE-dim-doc.md § 5.5)
2. If pattern is category-wide (≥80% of vendors) → flag as categorical-absence finding
3. If pattern is vendor-specific → may indicate the vendor has unusual operational maturity gap (e.g., a sub-brand's sitemap fails because the parent company serves marketing on the subdomain — itself a competitive-relevance signal)

**When two CompetLab tools disagree on the same surface:**

Per Phase 5.5 (cross-tool reconciliation) in `competlab-cmo-report.SKILL.md`:
- Identify the most-likely-correct tool by probe depth
- Surface the disagreement in the dim doc's caveats section
- Flag for platform-bug filing if not previously known

---

## Vendor-discontinuation detection pattern (banked from real-world validation)

The canonical "failed scan = strategic signal" pattern — surfacing customers monitoring competitors that no longer exist as live products.

### The 3-signal convergence rule

When ANY monitored competitor exhibits ALL THREE of these patterns, HYPOTHESIZE discontinuation/absorption/sub-brand-rollup:

1. **Positioning dashboard captures parent-brand content** — `mainHeadline` / `pageTitle` / `tagline` refer to a DIFFERENT company than the monitored vendor; `keyOfferings` list parent's product line (not the vendor's)
2. **AI Visibility mention rate is 0% across ALL 3 providers** — vendor is not surfaced in any "top X tools" query (for the relevant category)
3. **Agent-adoption scan `finalUrl` ≠ requested domain** — domain redirects at the host level to parent / different company

### Why the convergence matters

Any single signal alone could have other explanations:
- Signal 1 alone: maybe the vendor has a parent-company-themed homepage layout
- Signal 2 alone: maybe the vendor is a low-volume niche brand
- Signal 3 alone: maybe the vendor has migrated to a different primary domain

**All three together → discontinuation is the most parsimonious explanation.** Verify, then act.

### Verification action

1. **Include explicit context in funding-watch sub-agent prompt** for this vendor: "{vendor} ({vendor.com}) — possibly owned by {suspected-parent} (parent company in {location})." The parent-context framing lets the sub-agent search for parent's subsidiary announcements (which it would otherwise miss).
2. **Sub-agent uses Perplexity research** to find any "shutting down" / "discontinued" / "sunset" / "end-of-life" language tied to vendor + parent.
3. **Direct URL verification** via `mcp__competlab__fetch_url(bodyNeeded:true, cleanHtml:true)` against any parent-company page mentioning the vendor (e.g., `{parent.com}/{vendor-slug}`) — confirm the shutdown language exists in actual page body.

### Strategic implication

When the 3-signal convergence is confirmed via discontinuation evidence: this is THE most material strategic finding the briefing can produce for that customer. They've been monitoring a dead product for months/years without knowing. Surface as:

- **In strategic-thesis exposure list:** "Customer has been monitoring a dead competitor for X months. Drop and replace with [active alternative]."
- **In Monitoring Suggestions section:** explicit "REMOVE {vendor} (discontinued {date} by {parent})" + concrete replacement candidate
- **In the relevant comp doc:** brief ~60-line variant focused on (a) the discontinuation evidence + verification, (b) parent-company context if applicable, (c) explicit recommendation for monitoring-set adjustment + replacement

### Empirical basis

In a real-world B2B-CS-SaaS validation run, this 3-signal convergence surfaced one monitored competitor as discontinued ~12 months before the briefing was prepared. The customer would have continued monitoring the dead product indefinitely without this discovery. The strategic finding alone justified the briefing.

---

## How to surface partial-data findings in the briefing

When a dimension is partial because of bot-protection, JS-rendering, subdomain-isolation, iframe-embedding, or any other parseability constraint — the customer-facing strategic finding is **what the partiality means for THEIR discoverability**, not how you encountered it.

**Customer-language frame (lead with this):**
> "Your pricing data is invisible to automated systems — AI training crawlers, comparison-engine bots, and agent toolkits behave the same way as your monitoring pipeline. When AI is asked to compare prices in your category, your competitors' prices appear; yours don't. Closing this 1-day gap (static HTML pricing table) restores discoverability across the entire automation surface."

The pattern: name the customer-facing consequence (invisible to AI Viz / procurement engines / agent toolkits) + recommend the specific fix that restores discoverability. No mention of scanner mechanics, platform tools, or methodology — those stayed in your working memory.

---

## Reference examples — pattern → strategic finding for customer

| Pattern observed | Customer-facing strategic finding |
|---|---|
| Pricing in iframe-embedded widget; pricing dimension returns null while positioning shows pricing exists | "Pricing data invisible to automation — material AI Viz pricing-comparison consequence; static HTML pricing table is 1-day fix" |
| Pricing JS-rendered; pricing dimension returns null while positioning shows free-trial copy | "Pricing exists but isn't extractable by AI tooling; recommend static HTML pricing table alongside JS-rendered widget" |
| Docs on subdomain; content shows 0 docs while help.{domain} knowledge base exists at direct probe | "Help subdomain isn't surfaced via main-domain sitemap; cross-link help.{domain} from main-domain navigation + sitemap to restore AI-discoverability of support content" |
| Sitemap fetch partial across competitor set | "Several competitors' content surface is partially invisible to AI-mediated buyer-research — your customer's well-formed sitemap is a quiet competitive moat worth amplifying" |
| Vendor's homepage bot-protected | "Vendor X is invisible to AI training data + comparison crawlers — bot-protection is competitive self-harm in 2026 buyer-discovery; opportunity for your customer to surface where they're differently positioned" |
| `<sitemapindex>` root with thousands of child URLs | "Vendor X has a deep content surface (thousands of URLs across sub-sitemaps); your customer's content volume comparison should account for this — competitor isn't actually content-thin, the index just makes it look that way at a glance" |

The shape across all of them: positive customer-facing framing → strategic implication → concrete recommendation. No methodology references; no platform-mechanics; no diagnostic notes about how you measured it.

---

## How to use this doc

**Orchestrator on a new run:**
1. Read this doc at Phase 0 alongside the templates + URL Verification pattern.
2. During Phase 1 fan-out: when ANY dimension returns partial data for the customer's own site, apply the "cross-check with sibling dimensions" decision logic above — extract the discoverability-gap finding for the customer.
3. During Phase 2 dim-doc synthesis: when a dim has cascade-partial-data, structure the dim doc to lead with the customer-facing implication (what's invisible to AI tooling, what to do about it).
4. During Phase 5.5 cross-source consistency check: silently use the more credible signal; don't surface the check in customer-visible files.
5. During Phase 4 briefing synthesis: convert parseability gaps into "invisible to automation, material AI Viz consequence" framing per the reference examples above.

**Skill author iterating on a per-dim skill:**
- Reference the relevant dimension's signal-extraction guidance.
- Embed the cross-check logic in the skill's workflow.
- Use the customer-language frames above as the starting point for what the skill's output looks like.

**When you encounter a new partial-data pattern not in the reference examples above:**
- Apply the same shape: extract the customer-facing consequence + recommend the fix. The customer doesn't need to know what your monitoring pipeline experienced; they need to know what the partiality means for them.
- Optionally keep your own audit-trail notes in `_internal/_reconciliation-notes.md` for orchestrator-development feedback during active iteration — these are private working notes, never referenced from customer-visible files.

## Cross-source consistency — silent reconciliation principle

Sometimes two data sources show different signals about the same surface (e.g., one source reports a sitemap exists, another reports not-found at the same URL; one source reports security headers absent, another reports them present). This is normal in real-world data — sources have different fetch strategies, freshness windows, parsing depths.

**Your discipline:** pick the source with deeper probe-depth, use it, move on.

- Direct probes outweigh heuristic summaries.
- Recent scrapes outweigh older ones.
- Multi-source consensus (≥2 sources agree) outweighs singleton disagreement.

The briefing carries the conclusion. The cross-check process stays in your working memory. Customer-visible dim docs / comp docs / briefing / README never reference the cross-check — those are private analyst discipline, not customer-output.

---

## Competitive-narrative-correction pattern (banked from real-world validation)

A distinct kind of cross-source reconciliation that produces strategic findings — separate from the cross-TOOL reconciliation pattern above (which handles disagreements between CompetLab's own tools) and separate from the vendor-discontinuation 3-signal convergence pattern (which infers a vendor's existence).

This pattern handles the case where **a monitored competitor publishes comparison content about the customer with cited facts that are wrong/inflated/stale.** The discrepancy itself is a competitive-narrative signal worth surfacing in the briefing.

### The detection rule

For any vendor in the monitored set publishing comparison content about the customer (detectable via: their content sitemap including URLs matching `{customer-name}-pricing` or `{customer-name}-alternative` or `{customer-name}-vs` patterns, OR Perplexity search surfacing their guide pages about the customer), **cross-reference their cited customer-facts against**:

1. **CompetLab dashboard data** (authoritative live scrape, if dimension available for customer)
2. **≥2 independent third-party sources** — G2, Capterra, vendor's own pricing/about page via direct `fetch_url` probe, SaaSPricePulse-style aggregators, recent press releases

### Decision logic

```
IF all sources agree (≥3 independents) → use consensus directly in the briefing
IF customer's competitor disagrees AND all other sources agree
   → competitor's published content is wrong/stale/inflated
   → The discrepancy ITSELF is a competitive-narrative signal worth surfacing
     in briefing § 1 ("Where customer is unusually strong" — pricing verified
     against N independent sources; competitor X's published guide is wrong)
   → Customer-facing framing names the COMPETITOR'S published-narrative
     inaccuracy and the customer's response (transparency page); never references
     reconciliation methodology or cross-source check process
IF sources split (no clear consensus) → use whichever source is most credible
   (deeper probe-depth, more recent, direct vs aggregated); ship the conclusion;
   if no clear winner, mark the data as "varies across public sources" and
   surface ranges rather than point values
```

### Strategic frame for the briefing

When a competitor publishes wrong/inflated/outdated facts about the customer:
- **In strategic-thesis exposure list:** can become a strength bullet ("customer's pricing verified across N sources; competitor X's published comparison guide is wrong → buyers reading their guide get inflated impression of customer's cost")
- **In recommendations:** "publish a transparent customer-comms / pricing-facts page that gives the canonical numbers — neutralizes the competitor's wrong narrative within the buyer-research surface"
- **In Monitoring Suggestions:** the publishing-competitor stays monitored even if low AI-Viz, because they're a "narrative bellwether" — what they publish next predicts how third-party comparison-content surfaces will read

### Empirical basis

In a real-world validation run, a monitored competitor published a third-party guide claiming the customer's pricing was $9/$38/$69 across SKUs. CompetLab dashboard scrape + G2 page + SaaSPricePulse + topratedaisoftware + the customer's own pricing page all confirmed $0/$7/$29/$54. Four independent sources matched CompetLab; only the publishing competitor disagreed. The reconciliation was unambiguous: the competitor's guide is wrong. **This discrepancy is itself a strategic finding** — it tells the customer that buyers consulting that competitor's guide get an inflated cost impression, AND it provides a concrete CMO response (transparency page covering pricing facts).

### Relationship to other patterns

This is structurally distinct from:
- **Vendor-discontinuation 3-signal convergence** (infers presence; this infers correctness)
- **Cross-tool reconciliation** (resolves disagreement between CompetLab's own tools; this resolves disagreement between competitor's published content and external ground truth)
- **Discovery-vs-capability carve-out** (probes for hidden capability; this probes for misstated fact)

All four patterns share the discipline of **cross-source verification before strategic claims** — they're different applications of that discipline to different evidence types.

---

*Reference doc — accumulated failure-mode patterns from validation runs. Treat as a living reference for orchestrator decision-making.*
