# The CompetLab platform, for skills

What the platform is, what it exposes, and which tool answers which question.

Read `READING-THE-DATA.md` before reporting any of it.

---

## Setup

The MCP server is hosted. There is nothing to install.

```
https://mcp.competlab.com/mcp
```

| | |
|---|---|
| Transport | Streamable HTTP |
| Auth header | `CL-API-Key` |
| Key format | begins `cl_live_` |
| Query-param fallback | `?api_key=cl_live_…` |
| Server card | `https://mcp.competlab.com/.well-known/mcp/server-card.json` |

```bash
claude mcp add --transport http competlab https://mcp.competlab.com/mcp \
  --header "CL-API-Key: cl_live_your_key_here"
```

Keys come from **app.competlab.com → Organization Settings → API Keys**. One key covers the whole
organization. A read-only key is enough for every tool in this repo.

> `competlab.com/developers/mcp` is the **setup documentation page**, not the server URL. Pointing a <!-- facts-ok: this line is the correction -->
> client at it will not connect.

Setup docs: <https://competlab.com/developers/mcp>

---

## Six monitored dimensions

Each has its own page, its own history, and its own schedule.

| Dimension | Slug | What it measures |
|---|---|---|
| **AI Visibility** | `ai-visibility` | Which companies the AI models recommend in this category, and whether the customer is one of them |
| **AI Sources** | `ai-sources` | Which pages Perplexity and Google AI Overviews read while answering the category's buying questions, and whether the customer is named on them |
| **Positioning** | `positioning` | Homepage messaging — headline, value proposition, CTAs, audience, differentiator |
| **Pricing Intelligence** | `pricing` | Plans, billing models, free tiers, enterprise pricing |
| **Content Intelligence** | `content` | Sitemap analysis, categories, publishing activity, gaps |
| **Tech & Trust Profile** | `tech-trust` | Tech stack, security headers, trust signals, AI crawler access |

AI Visibility is the dimension no other CI platform has. AI Sources is its companion.

**Cadence is deliberately in flux** while the product is young. Read it from `list_schedules` rather
than assuming it, and do not write an interval into anything durable.

---

## AI Visibility — five engines

| Engine | `provider` value |
|---|---|
| ChatGPT | `openai` |
| Claude | `claude` |
| Gemini | `gemini` |
| Perplexity | `perplexity` |
| Google AI Overviews | `google_ai_overviews` |

A check asks the project's **3 prompts** across all five engines.

Google AI Overviews behaves differently from the other four: it names companies in prose and ranks
nothing, and it supplies none of the per-brand description the chat models do. See
`READING-THE-DATA.md` §10.

The dimension's answer is **core or tail** — read `summary.marketMap`, and `summary.promptMarket`
before it.

---

## AI Sources — two engines, by instrument

**Perplexity and Google AI Overviews only.** Not a cost decision: these are the only two engines that
return the actual page URLs they retrieved. ChatGPT and Claude return titles; Gemini returns opaque
redirects.

It asks **8 buying questions**, one per fixed buying intent, in a buyer's words with no brand names.

It reads a different prompt set from AI Visibility and shares no data with it.

The work list is `summary.coreHosts` filtered to `status: "missing"` — hosts two or more engines read
for this market that do not name the customer — then split on `ownership`, which has exactly two
values: `third_party` is approachable, `competitor_owned` is not. `summary.funnel.missingPublishers`
and `missingCompetitorOwned` carry that split already.

`kind` (`publisher`, `community`, `review_site`, `video`) is a separate field describing the sort of
site, not a filter for the work list.

**What it is, and is not.** It shows what the models read before answering. It does not tell a
customer what to do to be recommended. Two limits travel with every claim:

- **Training data often outweighs what the models read.** The models say so directly when asked.
- **A source can be read by every engine, every time, and belong to a company none of them
  recommend.** Being in the evidence layer is not being in the recommendation layer.

And the reason there is no universal checklist: **the factors differ by category.** Uptime-monitoring
leaders are weighed on distributed networks, pricing and reliability; database tools on certifications
and an entirely different set.

---

## The Strategic Briefing

The platform's own synthesis across **14 analysis areas** — the 6 monitored dimensions above, plus 8
it researches for the briefing alone:

`landscape` · `funding-capital` · `hiring-gtm` · `product-launches` · `reliability-status` ·
`agent-readiness` · `ai-ecosystem` · `customer-voice`

Editions are numbered and persist. A run takes about two hours.

Sections: `hub` (default — the executive digest), `actions`, `competitors`, and `deep-<area>` for each
of the 14. Read `contains` to see what an edition actually holds.

**Do not re-research the eight areas the briefing already covers.** It probes more sources, keeps
history to difference against, and states its own limits. Read the section.

---

## Tool map

38 tools. The ones these skills use, by question.

**Orientation**
| Question | Tool |
|---|---|
| Which projects can I see? | `list_projects` |
| When did each dimension last run? | `get_project` |
| Who is monitored? (includes the customer, `isOwn: true`) | `list_competitors` |
| Which pages are monitored for a competitor? | `get_competitor` |
| What is the schedule? | `list_schedules` |
| What changed and fired? | `list_alerts` |

**Per dimension** — each has `get_<dim>_dashboard` (latest), `get_<dim>_history` (paginated runs), and
`get_<dim>_run_detail` (one run), for `tech_trust`, `content`, `positioning`, `pricing`. Content adds
`get_content_changelog` (URLs added and removed).

**AI Visibility** — `get_ai_visibility_dashboard`, `get_ai_visibility_history`,
`get_ai_visibility_check_detail`, `get_ai_visibility_trend`.

`get_ai_visibility_trend` returns **one row per company** with a reading now, a reading at the start of
the window, and whether the two are separable — a digest, not a plot. `detail: "series"` adds each
company's share check by check, at most 12 points. Either way, a difference whose intervals overlap is
two readings and not a movement, so do not narrate a trajectory the separability flag does not support.

**AI Sources** — `get_ai_sources_dashboard`, `get_ai_sources_history`, `get_ai_sources_check_detail`.

**Briefing** — `get_briefing`, `get_briefing_history`, `get_briefing_edition`.

**Free tools — any public domain, no project required**

These take a `domain` and no `projectId`, so they work before a project exists. They are still tools on
the authenticated MCP server: a CompetLab API key is required, and a free-trial key is enough.

| Tool | What it does |
|---|---|
| `check_ai_crawlers` | Which AI crawlers a site's robots.txt allows or blocks |
| `check_sitemap` | Sitemap analysis and content-gap categorisation |
| `fetch_url` | Fetch any URL — renders JS, handles bot protection, `cleanHtml` for cheap reading |
| `start_agent_adoption_scan` → `get_agent_adoption_scan` | 25 checks, 0–100 score, L1–L3 level |
| `start_tech_stack_scan` → `get_tech_stack_scan` | Tech detection with the evidence behind each |
| `start_trust_signals_scan` → `get_trust_signals_scan` | 34 trust signals with the evidence for each |

The three `start_*` tools are async — poll the matching `get_*` with the returned `scanId`. Typically
30–90 seconds. Fire them in parallel; poll at a sensible interval, not aggressively.

---

## Reads are cheap, runs are not

Every dimension check and every briefing edition costs real money to produce — they query commercial
AI APIs and fetch hundreds of pages.

So: **read what the platform has already produced before asking it to produce more.** The stored
dashboards, histories and briefing editions are free to read and are almost always the right answer.
Never trigger a scan in a loop or an unattended sweep.

---

## Answer sizes

`includeAnswers: true` on the AI Visibility and AI Sources dashboards returns what the engines
actually said. It is large — roughly 25k tokens on a three-engine check, 46k on a five-engine one, and
the AI Sources page lists run to dozens of pages per answer.

Filter instead of fetching everything:

- `brand=` — one domain across every answer: roughly 2k tokens on a three-engine check, and about 9k
  against 46k once Google AI Overviews is in the ask, whose overview text and cited pages this filter
  keeps. The cheapest way to answer "where does this
  competitor beat me, and where are they invisible".
- `provider=` / `engine=` — one engine.
- `promptIndex=` — one question across every engine.

Read `summary.totalEntries` first to size the call.
