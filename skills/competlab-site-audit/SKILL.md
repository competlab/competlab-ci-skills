---
name: competlab-site-audit
description: |
  Audits a site the way an automated reader meets it — which AI crawlers robots.txt admits, what the sitemap exposes, which tech and trust signals a scanner can actually extract, and whether a claimed MCP server answers the protocol or only answers a browser. Runs on any public domain with no CompetLab project configured (a CompetLab API key is still required); with a project it audits the customer's own site and cross-checks it against what the monitored dimensions could and could not read from it. Use when the user asks "audit my site", "can AI crawlers read us", "are we blocking ChatGPT", "agent readiness", "trust signals check", "tech stack scan", "sitemap coverage", or "is that MCP server real". NOT for what the models say about the brand (use competlab-ai-visibility) or which pages they read while answering (use competlab-ai-sources). Mode A requires the CompetLab MCP server and any API key; Mode B additionally requires an active project.
license: MIT
allowed-tools: mcp__competlab__check_ai_crawlers mcp__competlab__check_sitemap mcp__competlab__fetch_url mcp__competlab__start_agent_adoption_scan mcp__competlab__get_agent_adoption_scan mcp__competlab__start_tech_stack_scan mcp__competlab__get_tech_stack_scan mcp__competlab__start_trust_signals_scan mcp__competlab__get_trust_signals_scan mcp__competlab__list_projects mcp__competlab__list_competitors mcp__competlab__get_tech_trust_dashboard mcp__competlab__get_positioning_dashboard mcp__competlab__get_pricing_dashboard mcp__competlab__get_content_dashboard Bash Read
metadata:
  author: competlab
  version: "3.0.2"
  website: https://competlab.com
  category: competitive-intelligence
---

# Site audit — the site as a machine finds it

## The question this skill answers

**Can an automated system extract this company's signals from its site?**

Not *is the site good*. Every check here is a proxy for that one question, and the audience is a
crawler, an extractor or a model — none of which read a hero image, infer a price from a sales call,
or wait for a modal to close.

This is the only skill in the suite that runs with **no project set up** — the free tools take a domain
and no `projectId`. They are still tools on the authenticated MCP server, so a CompetLab API key is
required; a free-trial key is enough. Mode A works on any
public domain, which makes it the way in. Mode B runs the same audit on the customer's own site and
cross-checks it against what the monitoring dimensions actually managed to read.

## Before you start

Read `references/reading-the-data.md`. One rule does most of the work here: a scan that could not read a
site is not a site with nothing on it. `null` is not zero, and "no trust signals found" is the
sentence that hides the difference.

## Mode A — any domain, no account

**1. Fire the three scans in parallel.**
`start_agent_adoption_scan`, `start_tech_stack_scan`, `start_trust_signals_scan`. Each takes a
`domain` and no `projectId`. Send all three before you wait on any of them.

**2. Poll the matching `get_*` at a sensible interval.**
`get_agent_adoption_scan`, `get_tech_stack_scan`, `get_trust_signals_scan`, each with the `scanId`
that came back. A scan typically finishes in 30–90 seconds. Wait, then check — **do not poll in a
tight loop, and never re-fire a scan to hurry one along.** Re-firing buys a second scan, not a faster
first one, and it costs a real run. One pass over a domain, never a sweep.

**3. The cheap reads, while the scans run.**
- `check_ai_crawlers` — see the rules below; this one is misreported more than anything else here.
- `check_sitemap` — what the sitemap exposes, and which content categories it does not.
- `fetch_url` with `cleanHtml: true` — any page a scan flagged, and any page the customer believes
  carries a signal the scans say is absent.

**4. Read agent adoption as a level, not a number.**
25 checks, a 0–100 score, an L1–L3 level. Report the level and **which scored checks failed** — a
score on its own tells nobody what to do on Monday. A failed check names one specific missing thing,
and those names are the report.

Not every failed check is a finding. Some carry `scored: false` and `weight: 0` — they are
presence-only and informational, and several ship their own text saying most sites do not publish the
thing. **Put only failed checks that are actually scored on the fix list.** An informational miss goes
in a footnote or nowhere.

## Reading crawler access — the rules that get broken

`check_ai_crawlers` is the check most often reported wrongly. Four rules, all from the platform:

**Check `robotsTxt.read` first.** If robots.txt could not be read, there is no verdict — no assistant
access, no crawler list, no advice. **A failed read is not an open site**, and it is not a blocked one.

**`assistantAccess` is the answer.** One verdict per assistant — ChatGPT, Claude, Perplexity,
Microsoft Copilot, Google AI Overviews, Gemini Apps — with the crawlers that decided each named beside
it. There is deliberately no overall score and no stored total; if you want a count, count the array.

**It says an assistant is permitted to fetch the site. It never says the assistant cites it.** Do not
turn "allowed" into "visible".

**`modelTrainingAccess` is a separate, neutral fact.** Blocking training crawlers costs no assistant
visibility and is a legitimate content decision. **Never report it as a gap, and never advise undoing
it.** The one exception is mechanical, not a judgement call: where a token under
`modelTrainingAccess[].decidedByCrawlers` *also* appears under `assistantAccess[].decidedByCrawlers`
— `Google-Extended` is the documented case — that block does cost visibility. Match on
`userAgentToken` before applying the general rule.

And the finding people miss: `crawlers[].ruleAudience` says whether a rule **named** the crawler or a
`User-agent: *` catch-all swept it up. The catch-all is usually accidental, which makes it the more
actionable of the two.

**All four rules apply identically to `aiAccess` on `get_tech_trust_dashboard` in Mode B** — same two
questions, same opposite valence, same `Google-Extended` exception. And every verdict there ships its
own `explanations` sentences: render them, do not rewrite them.

> **Do not mix the two trust-signal taxonomies.** The free scan and the Tech & Trust dimension count
> different things under similar names — `socialProof` exists on both, spelled identically, with
> different members. Quote each with the surface it came from, and never present a change between them
> as a change in the site.

## Mode B — the customer's own site, with a project

**1. Resolve the own domain.** `list_projects` → `list_competitors`; the customer's row is the one
carrying `isOwn: true`. Do not take the domain from the user's message when the project already
holds it.

**2. Run the Mode A audit on that domain.**

**3. Cross-check against what the dimensions read.** Pull the customer's own row from
`get_tech_trust_dashboard`, `get_positioning_dashboard`, `get_pricing_dashboard` and
`get_content_dashboard`, and set each against the free scans:

| The dimension's own row | The free scan | What it means |
|---|---|---|
| `null` | read the site fine | **Parseability gap** — the page is there, the extractor could not use it |
| `null` | also failed, or crawlers blocked | **Access gap** — nothing can read this site, the dimension included |
| a value | — | measured; no finding here |

**The parseability gap is the finding worth the whole audit.** A pricing page a person reads happily
and an extractor returns nothing from is the same failure, on the same page, that decides whether a
model answering a buying question can say anything concrete about this company. The signal exists and
does not survive extraction. Say it that way, and name the sibling check that proves the data is
there.

Never report a `null` dimension as an absence — "no pricing published" when the field is `null` is
exactly the error this cross-check exists to catch.

## Verifying a claimed MCP server

An audit turns up MCP-server claims — typically at `mcp.{domain}`, `api.{domain}/v1/mcp`,
`developers.{domain}/mcp`, or `{domain}/.well-known/mcp`. **A browser GET returning 200 proves a web
server answered. It does not prove an MCP server exists.** MCP speaks JSON-RPC 2.0 over HTTP POST; a
GET is not a protocol-compliant request, and what comes back to one — placeholder HTML, an empty
body, a docs page, a 405 — is implementation detail that settles nothing either way.

The canonical test is a JSON-RPC POST. Use Bash:

```bash
curl -sS -X POST "<candidate-url>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --max-time 15 \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"competlab-verify","version":"1.0"}}}'
```

| Response | Verdict |
|---|---|
| 200 + JSON body with `"jsonrpc":"2.0"` + `"result"` | **REAL MCP server (no-auth)** |
| 401/403 + JSON-RPC error body (e.g. `"Authorization required"`, code -32xxx) | **REAL MCP server (auth-gated)** |
| 404 + HTML "Cannot POST /" | NOT MCP (Express server, no MCP routing) |
| 403 + CDN error ("method not allowed" / "cacheable only") | NOT MCP (CDN config prohibits POST) |
| 405 Method Not Allowed | INCONCLUSIVE — flag for manual review |
| Network error / timeout | URL doesn't actually serve — drop |

An error body is not a failed test: a JSON-RPC error proves the server speaks the protocol. Auth-gated
is a real MCP server.

For one that verified real, enumerate the tool surface:

```bash
curl -sS -X POST "<verified-mcp-url>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

If that comes back "Authorization required", the server is real and gated — read the documentation
page with `fetch_url` (`cleanHtml: true`) and take the tool list from there instead.

## Output

Short, and ordered by what a fix costs against what leaving it costs. Nothing else orders this
report.

```markdown
# Site audit — {domain}
*{scan date}. {Mode A: public checks only, no project | Mode B: cross-checked against {Project}}.*

## What an automated reader gets today
{2–3 sentences. Crawler access first, then whether the signals survive extraction.}

## Findings, cheapest fix first
| Finding | The fix | Effort | What it costs to leave |
|---|---|---|---|
{rows}

## Read but not parsed
{Mode B only — dimensions null against a scan that read the same site fine.}

## MCP claims
{Only if the audit found one. URL, verdict, and the response that decided it.}

## What we could not read
{Scans that failed, pages that timed out, crawlers that blocked us. Not findings about the site.}
```

**Be concrete about the one-day class.** A robots.txt directive blocking a named AI crawler is one
line and a deploy. A sitemap that omits a whole content section is a config change. A missing security
header is a header. Keep those apart from the ones that are a quarter of content work, and say which
is which — a list that mixes them is a list nobody starts.

## What NOT to do

- Do not poll a scan aggressively, and do not run scans in a loop or across a list of domains
  unattended. Every run costs real money.
- Do not read a failed scan as a finding about the site. An unreadable site and a site with nothing
  on it produce the same empty report and mean opposite things.
- Do not call a 200 on GET an MCP server. The POST decides it.
- Do not report the agent-adoption score without the level and the failed checks behind it.
- Do not hand over a generic best-practice checklist. What is missing on this domain is the report;
  what is missing on domains in general is not.
- Do not order findings by how large they sound. Order by fix cost against the cost of leaving them.
- Do not tell the customer what the models say about them — that is `competlab-ai-visibility`, and
  nothing in this audit predicts it.

## Decision questions

End with 3–5 questions whose answers would change what gets fixed first. Tie them to what this audit
found, and state both branches where the branch matters:

> "Three of these are a single deploy and the fourth is a content project. If someone can ship the
> three this week, the audit closes by Friday; if the same person owns both, the content project
> starves. Who is doing which?"
