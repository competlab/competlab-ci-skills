# Shared Skill Pattern — URL Verification via `mcp__competlab__fetch_url`

**Status:** Locked design pattern. Embedded in every skill that consumes citations from non-authoritative research sources (primarily Perplexity).

**Audience:** this doc is your private orchestrator-internal reasoning about how to verify claims before they ship. It does NOT shape what your customer-visible deliverables look like. When the verification confirms a finding, surface the finding in customer-language — "Vendor X has shipped an MCP server, verified live at `app.vendor.com/mcp`" — never the methodology that produced it ("per JSON-RPC POST per discovery-vs-capability carve-out per Steps M1-M3"). The customer reads the conclusion; your verification chain stays in your working memory.

**Uses MCP tool `mcp__competlab__fetch_url`** for URL verification + lightweight content retrieval.

**Empirical basis:** validation runs in the CRM B2B SaaS category found **5 of 7 Perplexity-cited GitHub MCP-repo URLs were 404** — fabricated by the LLM with citation-grade confidence. The 6th was real but had ~10x star-count inflation. Without verification, fabricated competitive intelligence ships to customer CMO briefings as fact.

---

## Why this lives as a skill pattern, not as a service

Naive design was a per-domain verifier service: `verifiers/github.ts` parses GitHub URLs and queries the GitHub API; `verifiers/news.ts` for blog/news citations; LLM-fuzzy-match layer for soft claims. That design **reinvents the agent's own capability**. Skills are executed by an LLM agent — the same agent that's perfectly capable of reading an HTML body and reasoning about whether it supports a specific claim. Building a server-side claim-verifier means duplicating the agent's reasoning surface in code, slower and less flexible.

Right design is two layers, both extremely thin:

- **Layer 1 — existence check.** Pure HTTP via the MCP tool. The tool returns `status` directly — `status: 404` proves URL was hallucinated; catches the dominant failure mode observed in validation runs.
- **Layer 2 — claim verification.** Agent-driven. `fetch_url` returns `body` + `cleanHtml: true` strips 85-95% of HTML noise; the agent reads the cleaned body and judges whether each Perplexity-cited claim is supported. The LLM IS the verifier — no server-side code required.

Net result: zero new infrastructure. URL Verification Middleware exists as **a few lines in skill prompts** plus `mcp__competlab__fetch_url` (already shipped as part of the CompetLab MCP server).

---

## The pattern (skill-author copy-paste reference)

For every URL cited by Perplexity (or any non-authoritative source) in skill output, before including that citation in the final briefing:

### Step 1 — fetch with body + cleanHtml

Call the MCP tool:

```jsonc
mcp__competlab__fetch_url({
  "url": "<perplexity-cited-url>",
  "bodyNeeded": true,
  "cleanHtml": true,
  "headersNeeded": false       // verification rarely needs response headers
})
```

`cleanHtml: true` is **load-bearing**, not optional — it's the difference between feeding the agent ~10KB or ~150KB per verification. Required field: `bodyNeeded: true` (cleanHtml requires it). With it, verification cost stays within token budget for a 20-citation briefing.

### Step 2 — existence check

Read `ok` and `status` first:

| Outcome | Action |
|---|---|
| `ok: true, status: 200` | URL exists. Proceed to Step 3. |
| `ok: true, status: 404` (or any 4xx) | URL is hallucinated OR moved-then-removed. **Drop the citation entirely.** |
| `ok: true, status: >= 500` | Upstream error. Retry once with backoff. If still failing → drop. |
| `ok: false, reason: "bot_protection_detected"` | URL exists but page is gated. Cite cautiously as "exists, content unverifiable." |
| `ok: false, reason: "all_probes_blocked"` | Same as above — URL exists, content can't be read. |
| `ok: false, reason: "fs_failed"` | DNS/connectivity issue. Retry once. Then drop. |
| `ok: false, reason: "body_too_large"` | Upstream sent >15MB. Raise `bodyMaxBytes` for legitimate large case or drop. |

### Step 3 — claim verification (agent reads body)

For each specific claim Perplexity made about this URL, ask yourself (the agent reading the cleaned body):

> "Does this page actually support the specific claim — including the specific numbers, names, dates, products mentioned?"

Common claim types and what to look for:

- **GitHub repo facts** — star count, owner, primary language, last commit date. Cleaned HTML still contains these in the repo header block.
- **News / blog article** — date, author byline, the specific quoted text or statistic Perplexity claimed appeared on the page.
- **Company website / product page** — does the page actually mention the product/feature/pricing tier cited?
- **Stat citation** — does the source contain the cited number, in context?

If clear evidence for a claim → mark **verified**.

If the page exists but doesn't contain the specific claim → mark **unverified** and either drop the claim or include it with explicit caveat: `"per Perplexity (could not verify on source page)"`.

If the cited URL contradicts the claim (Perplexity said 12k stars, page shows 1.2k) → drop or correct, and **log as Perplexity-confabulation evidence** for the per-skill quality dashboard.

### Step 4 — compose final output

Only include verified citations in the briefing. Unverified-but-existing citations may appear with explicit caveat. Hallucinated (404'd) and unfetchable citations are dropped silently — they don't reach the customer.

---

## Beyond verification — `fetch_url` is also the agent's primary research-fetch tool

Same tool, three use cases inside skills:

1. **URL verification** (this pattern, Steps 1-4 above).
2. **Lightweight content retrieval** — when Perplexity cites a fact and the agent wants to read the source body directly to extract precise wording/numbers without re-prompting Perplexity (saves Perplexity context budget for synthesis).
3. **Deeper-dive research** — when Perplexity suggests "see also: X.com/article" and the agent wants to read the full article to enrich a claim. `fetch_url` + `cleanHtml:true` lets the agent ingest the article cheaply.

One tool, three discipline patterns. Each skill author should know all three.

---

## MCP-server-claim verification — special sub-pattern

**Empirical basis:** During internal validation runs, multiple MCP-claim URLs returned HTTP 200 + HTML body to browser GET via `fetch_url`. Initial interpretation: "200 + empty/placeholder HTML = no MCP shipped." That was WRONG methodology — MCP servers are JSON-RPC endpoints and don't return HTML to browser GETs. The HTML response on GET could mean: (a) no MCP, (b) real MCP that handles browser GETs with a placeholder, (c) real MCP that handles browser GETs with an error.

**The canonical MCP-verification test is a JSON-RPC POST.**

### Why the general `fetch_url + cleanHtml` pattern doesn't suffice for MCP URLs

MCP servers speak the JSON-RPC 2.0 protocol over HTTP POST (per the MCP specification at modelcontextprotocol.io). A browser GET on an MCP URL is not a protocol-compliant request — what the server returns depends entirely on implementation:

- Some return 200 + placeholder HTML
- Some return 200 + empty body
- Some return 405 Method Not Allowed
- Some return a documentation page

**None of these GET responses tell you whether a real MCP server exists at that URL.** The only reliable test is to make a JSON-RPC POST.

### The pattern

For any URL claimed to host an MCP server (typical patterns: `mcp.{vendor}.com`, `api.{vendor}.com/v1/mcp`, `developers.{vendor}.com/mcp`, `{vendor}.com/.well-known/mcp`):

#### Step M1 — JSON-RPC POST with initialize method

```bash
curl -sS -X POST "<mcp-url>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --max-time 15 \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"competlab-verify","version":"1.0"}}}'
```

#### Step M2 — interpret response

| Response | Interpretation | Action |
|---|---|---|
| **HTTP 200 + JSON-RPC response** (with `jsonrpc:"2.0"` and `result` or `error` field) | **REAL MCP server**. The server speaks the protocol. | Cite as MCP server. Auth may be required (a JSON-RPC error like "Authorization required" still proves it's an MCP server). |
| **HTTP 401/403 + JSON-RPC error body** (e.g., `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Authorization required"}}`) | **REAL MCP server, auth-gated** | Cite as MCP server with auth requirement |
| **HTTP 404 + HTML body** (Express-style "Cannot POST /") | NOT MCP — server exists at the domain but no MCP routing | Drop the MCP claim |
| **HTTP 403 + CloudFront/CDN method-not-allowed error** | NOT MCP — CDN only allows GET/HEAD, can't even route MCP-style POSTs | Drop the MCP claim |
| **HTTP 405 Method Not Allowed** | Could be NOT MCP, OR could be a misconfigured MCP server. Inconclusive — flag and investigate. | Mark unverified, look for documentation |
| **Network error / timeout** | Server doesn't exist or is unreachable | Drop the MCP claim |

#### Step M3 — for richer verification, try `tools/list`

```bash
curl -sS -X POST "<mcp-url>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

A real MCP server with `tools/list` capability returns a JSON-RPC response with a `tools` array. This both confirms the server AND enumerates its tool surface — useful for the `agent-adoption` skill to extract per-tool capabilities.

If `tools/list` returns "Authorization required" — the server is real, gated. Note the auth model from the documentation page (typically separate from the MCP URL itself).

### Empirical example shapes (real-world JSON-RPC POST verification)

- **REAL MCP server (auth-gated):** vendor publishes documentation page at `{domain}/developers/ai/mcp-server/` (HTML) describing the actual MCP endpoint at `api.{domain}/v1/mcp` (the API endpoint, not the docs page). POST initialize returns HTTP 401 + `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Authorization required"}}` — JSON-RPC error body proves the server speaks the protocol. Confirmed real MCP, auth required to use.
- **FALSE-POSITIVE 1 — Express server with no MCP routing:** vendor reserved `mcp.{domain}` subdomain but never implemented MCP. GET returns HTTP 200 + "Domain not found" HTML (parking-page style). POST initialize returns HTTP 404 + `"Cannot POST /"` (Express error). Definitively NOT MCP.
- **FALSE-POSITIVE 2 — CDN-fronted static path:** vendor reserved `developers.{domain}/mcp` URL but the path is served via CDN with cache-only configuration. GET returns HTTP 200 + empty HTML. POST initialize returns HTTP 403 + CloudFront "method not allowed" error — the URL is configured as cacheable-only, MCP-impossible architecturally.

### Categorical-zero case (banked from real-world validation)

If the platform's `start_agent_adoption_scan` returns ZERO MCP Server Cards at well-known paths across ALL competitors in the project, **the categorical-zero applies to DISCOVERY only, not to CAPABILITY.**

**CRITICAL — discovery ≠ capability.** Before declaring categorical-zero MCP adoption, check for capability evidence via alternative channels:

1. **Content dashboard URLs** — does any vendor's sitemap surface URLs matching `*/mcp-server/*`, `*/mcp/*`, `*/developers/ai/*`, `*/agent-toolkit/*`? Real MCP servers often have documentation pages at these paths even when no Server Card exists at `/.well-known/mcp`.
2. **npm registry** — does any vendor publish `@{vendor}/mcp-server`, `{vendor}-mcp`, `mcp-{vendor}` packages? Some vendors distribute MCP via npm without well-known mount.
3. **GitHub search** — does any vendor have `{vendor}-mcp` or `mcp-{vendor}` repos? Same shape as npm.
4. **Recent press releases / product announcements** mentioning the capability — vendor may have ANNOUNCED an MCP foundation without yet shipping discoverable infrastructure. This is itself a strategic signal (see "announcement-vs-infrastructure gap" below).
5. **API endpoint pattern probes** — for any vendor surfaced via channels 1-4, JSON-RPC POST verify their `api.{domain}/v1/mcp`, `api.{domain}/mcp`, `mcp.{domain}` candidates per Steps M1-M3 above.

**Announcement-vs-infrastructure gap (banked from real-world validation):** if channel 4 surfaces a capability CLAIM but no discoverable infrastructure exists (channels 1-3 + 5 all return zero), classify as "announcement-vs-infrastructure gap" rather than categorical-zero. The strategic framing is: "vendor X claimed capability on [date]; infrastructure not yet discoverable → 6-12 month first-mover window remains open before the claim matures into discoverable surface." This is a distinct outcome from both "true categorical-zero" (no claim, no infrastructure) and "discovery-zero-capability-yes" (no well-known mount but JSON-RPC POST verified at alt-endpoint). Don't treat an announced-but-not-shipped capability as if it doesn't exist; don't treat it as if it does either.

**Decision logic:**
```
IF discovery scan returns 0 MCP Server Cards across all vendors:
  FOR each vendor:
    IF vendor's content dashboard URLs include mcp-keyword
       OR vendor has npm/GitHub mcp-package presence:
      → Probe alternative discovery channels
      → JSON-RPC POST verify any candidate URL found
  IF any vendor has capability via alternative channel:
    → Categorical-zero is on DISCOVERY surface only, NOT capability
    → Document the discovery-vs-capability split (which vendors via well-known path vs. alt-channel)
  ELSE:
    → Genuine categorical-zero on both discovery and capability
    → Apply categorical-zero halt-and-report pattern below
```

**Empirical basis:** in a real-world B2B-CS-SaaS validation run, the platform's `start_agent_adoption_scan` reported 0 MCP Server Cards across 8 vendors (categorical-zero on discovery). One vendor's content dashboard surfaced `https://{vendor}.com/developers/ai/mcp-server/` as a sitemap URL. Probing `api.{vendor}.com/v1/mcp` via JSON-RPC POST returned `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Authorization required"}}` (HTTP 401) — **REAL MCP server, auth-gated, not discoverable via well-known path.** Without the discovery≠capability carve-out, the briefing would have shipped false categorical-zero claim AND missed the canonical convergence paragraph competitor finding.

**Only after the discovery-vs-capability check passes with TRUE categorical-zero** — proceed with skip-M1-M3 + record as "first-mover whitespace open":

The JSON-RPC POST verification is a no-op when there are no URLs to verify (including the alt-channel ones). Don't burn time probing speculative URL patterns that no signal points to.

Record the finding as: "Categorical zero MCP adoption in [category]. First-mover whitespace open." Surface as strategic recommendation in briefing (the absence IS the signal — one of the most strategically asymmetric positions a vendor can find).

---

## Categorical-zero as general pattern (banked from real-world validation)

The MCP-specific categorical-zero sub-pattern generalizes. Whenever a research-step (URL verification, status-page probe, JSON-RPC POST, G2/Capterra scrape, llms.txt discovery, hiring-ATS probe, funding-event search) returns ZERO candidates across ALL surveyed vendors in a category, treat the absence as a first-class strategic finding rather than a research gap:

1. **Document the category-wide absence explicitly** in dim-doc § 5.5 (categorical-absence-as-first-class-finding structure per TEMPLATE-dim-doc.md).
2. **Skip downstream verification steps** that would be no-ops on the zero-candidate set (save wall-clock + token budget).
3. **Surface the absence in the briefing as strategic signal** — typically "first-mover whitespace open" or "category buyer-discovery happens elsewhere" framing depending on what's absent.
4. **Identify what the data WOULD look like if present** (forward-signal threshold) so future runs know when the absence has flipped.

Known categorical-zero patterns from empirical runs:
- **MCP-server-card discovery** (hospitality, vacation-rental, indie-operator, web-personalization categories)
- **G2/Capterra/Trustpilot review data** (hospitality, vacation-rental — buyers discover via Reddit / Facebook / conferences)
- **Public ATS feed presence** (indie-operator vertical clusters; <10-employee bootstrap operators)
- **Disclosed funding rounds in last 24 months** (bootstrap-dominant categories)
- **Structured /changelog adoption** (hospitality, indie-operator categories — sitemap-diff is the only product-velocity signal)

When you detect a new categorical-zero pattern, append to this list during the next iteration cycle.

### Research-channel signal vs. category-property signal (banked from real-world validation)

When a sub-skill returns zero/minimal data for ≥N-1 vendors in the surveyed set, there are two underlying causes — each warrants a different customer-facing frame.

**Cause A — research-channel limitation.** The data likely exists; the channel you used can't see it. Examples:
- G2 / Capterra reviews are thin in indie-bootstrap categories (vendors exist; reviews live on Reddit / HN / Twitter)
- Public ATS feeds aren't exposed for <10-employee teams (hiring happens via founder DMs / referrals, not Greenhouse / Lever)
- Funding-round disclosure is thin for bootstrap-dominant verticals (no equity raise to disclose)

**Cause B — real category property.** The absence IS the truth of the category. Examples:
- MCP Server Cards genuinely don't exist in a vertical (no vendor has shipped one — first-mover whitespace IS open)
- Structured /changelog adoption is genuinely absent (vendors release via blog posts only — sitemap-diff is the only signal)

**Customer-facing frame for each cause:**

- **Research-channel limitation → coverage note about where the signal actually lives.** Surface as: *"Public ATS feeds are thin in this category — hiring activity for these vendors lives in founder networks and referrals, not on standard ATS APIs. To assess hiring trajectory in this category, the high-signal channels are founder LinkedIn updates + recent Twitter/X exec-introduction posts + occasional venture-firm portfolio communications."* The customer learns where the signal actually lives + can direct their own research accordingly.
- **Real category property → strategic finding.** Surface as: *"No vendor in your category has shipped an MCP Server Card. First-mover whitespace is open — being the first to ship an agent-discoverable MCP Server Card establishes a 6-12 month positioning window before peers catch up."*

**When unsure which cause applies — default to research-channel-limitation framing.** Strategic findings should be backed by signal, not by absence-of-signal-from-one-channel. The cost of under-claiming (treating a real first-mover-opportunity as just a channel-limitation) is lower than over-claiming (declaring whitespace open when actually the signal exists elsewhere).

**Empirical basis:** in a real-world validation run, the hiring dimension surveyed 8 vendors and found discoverable ATS data for only 1 (the rest hired through founder networks). The cold instance correctly classified this as research-channel-limited and surfaced as a coverage note about where hiring signal actually lives in this vertical — preserving the strategic-finding frame for cases where the absence really is the category truth.

### Skill design implication

The `competlab-agent-adoption` skill MUST embed Steps M1-M3 for any MCP-server claim before reporting in skill output. The general `fetch_url` GET pattern alone is insufficient for MCP verification — it gives false positives (URL exists but no MCP) and could give false negatives (server responds 200 to GET but is real MCP).

For categorical-zero markets, follow the "skip M1-M3, record absence as finding" pattern above — don't speculatively probe URLs that the platform scan already determined don't exist.

The `competlab-cmo-report` orchestrator should similarly re-verify any MCP claim that appears in synthesized briefing output via JSON-RPC POST as final QC.

---

## What `fetch_url` returns (relevant fields for verification)

| Field | Use for |
|---|---|
| `ok` | Top-level success / failure dispatch (see table in Step 2). |
| `status` | Upstream HTTP status. 404 = hallucinated URL. 200 = exists, proceed to claim check. |
| `body` | Cleaned HTML for the agent to read + reason about claims. |
| `contentType` | Helps the agent know how to interpret body (most often `text/html`). |
| `finalUrl` | If different from requested URL, Perplexity's cited URL redirected. Worth noting; sometimes signals stale citation. |
| `cleanStats` | `reductionPercent` for logging — how much was stripped. Useful to confirm cleanHtml ran. |
| `headers` / `headersAvailable` | Only returned when `headersNeeded:true`. Rarely needed for verification. |
| `reason` (on `ok: false`) | See Step 2 table for handling. |

---

## Cost / latency budget

Per verified Perplexity-cited URL:

- `fetch_url` call: ~3-8s for HTML pages, ~0.3-0.5s for plain-text targets (robots.txt-like).
- `cleanHtml` saving: typically 85-95% reduction on real pages.
- Agent token cost for verification: ~5-15K tokens per cleaned page (down from 50-200K raw).

A CMO briefing with 20 cited URLs ≈ 60-160s of fetch wall-time + 100-300K tokens of LLM verification. Acceptable for async-produced briefing.

---

## Skills that MUST use this pattern

Any skill consuming Perplexity output should embed Steps 1-4. Confirmed list:

- `status-watch` — verifies cited corporate-announcement URLs
- `funding-watch` — verifies cited funding-round source URLs
- `hiring-signals` — verifies cited job-board / careers-page URLs
- `ai-ecosystem` — verifies cited MCP-server GitHub repo URLs (**canonical use case validated against real-world Perplexity hallucination patterns**)
- `product-watch` — verifies cited product-launch announcement URLs
- `customer-voice-snapshot` — verifies cited review-platform URLs + review-count claims

The CMO briefing **orchestrator** (`competlab-cmo-report`) also runs this verification as a final QC pass across merged sub-skill output — catches anything that slipped through individual skill verification.

---

## What this pattern explicitly is NOT

- Not a server-side service or backend module.
- Not a per-domain verifier library (`verifiers/github.ts` etc).
- Not an LLM-as-a-service for fuzzy matching.
- Not a separate MCP tool — agents use `mcp__competlab__fetch_url` directly and reason about results.

It's a skill-prompt convention. If you find yourself building infrastructure to support URL verification beyond the `fetch_url` primitive and this pattern doc, stop and re-read this file.

---

## Related

- `mcp__competlab__fetch_url` is exposed by the CompetLab MCP server — schema includes `url`, `bodyNeeded`, `headersNeeded`, `cleanHtml`, `bodyMaxBytes`, `maxTimeoutMs`.
- cl-fetch service (the implementation behind the MCP tool): `competlab-fetch-service` repo.
- Empirical evidence for fabrication rate: surfaced during CRM-category validation research (significant percentage of Perplexity-cited GitHub MCP repo URLs were 404 / fabricated).
- URL Verification Middleware was named as Q1-mandatory prerequisite in the original Skills Improvement Plan.
