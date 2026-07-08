---
name: competlab-agent-adoption
description: |
  Wraps CompetLab's existing 25-check Agent-Adoption Scan (open Agent-Adoption Specification) for each monitored competitor + adds on-demand JSON-RPC POST verification for any MCP-server URLs detected by the scan. The platform scan covers discoverability, access control, content readability, and agent endpoints. This skill's value-add: PROTOCOL-LEVEL verification of MCP claims (browser GET 200 ≠ MCP exists), cross-competitor synthesis, strategic interpretation. Use when the user asks "does competitor X have a real MCP server", "agent-adoption posture in [category]", "Agent Adoption comparison", "is competitor's MCP claim real". Requires CompetLab MCP (start_agent_adoption_scan + get_agent_adoption_scan + list_competitors) + Bash for JSON-RPC POST verification.
effort: low
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors mcp__competlab__start_agent_adoption_scan mcp__competlab__get_agent_adoption_scan mcp__competlab__check_ai_crawlers mcp__competlab__fetch_url Bash
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Agent Adoption Intelligence

You measure first-party AI-agent infrastructure for each monitored competitor: MCP server, agent endpoints, Claude Skills, agent toolkit. **This skill is a thin wrapper around CompetLab's existing platform scan + a value-add verification pass.**

## What CompetLab's platform already does (Agent-Adoption Spec — 25 checks)

The platform's `start_agent_adoption_scan(domain)` runs **25 checks across 4 categories** per the open Agent-Adoption Specification:
1. **Discoverability** — how easy is the vendor to find for AI agents
2. **Access control** — what AI access permissions are declared
3. **Content readability** — how AI-friendly is the content surface
4. **Agent endpoints** — does the vendor declare callable agent surfaces (MCP / API / etc.)

The platform handles the breadth probing. **This skill should NOT reinvent that.**

## What this skill ADDS on top of the platform

1. **Protocol-level MCP verification** — when the platform detects a candidate MCP URL, this skill verifies via JSON-RPC POST whether it's a real MCP server (vs placeholder / parking page / browser-GET 200). Per `PATTERN-url-verification.md` § MCP-server-claim verification.
2. **Cross-competitor synthesis** — the platform returns per-domain results; the skill produces patterns across the monitored set
3. **Strategic interpretation** — the platform returns raw metrics; the skill produces "this means X for your brand"
4. **Optional AI-crawler context** — also calls `check_ai_crawlers` for related-but-distinct signal (how the vendor's robots.txt + meta tags treat AI bots — GPTBot, ClaudeBot, Google-Extended, PerplexityBot)

## Workflow

### Step 1: Identify competitor set

```
list_projects → confirm project context
list_competitors → get monitored domain list
```

### Step 2: Fan out platform scans (parallel)

For each monitored competitor domain:
```
mcp__competlab__start_agent_adoption_scan(domain) → scanId
```

Optionally also start ai-crawler scan for richer context (related but distinct):
```
mcp__competlab__check_ai_crawlers(domain, industry: "saas-tech" | "other") → per-bot verdict
```

### Step 3: Poll for completion (5-10s intervals, typical 30-90s per scan)

```
mcp__competlab__get_agent_adoption_scan(scanId) → status / results
```

Continue until status === "completed". Collect the 25-check report per competitor.

### Step 4: Extract MCP-candidate URLs from each scan result

The platform's "agent endpoints" check category will surface any declared MCP URLs (e.g., from `/.well-known/mcp` discovery, sitemap detection, or content-readability cues like links to a documented MCP server). Collect these URLs per competitor.

**Categorical-zero — CHECK DISCOVERY-VS-CAPABILITY FIRST (banked from real-world validation):**

If the platform's well-known-path scan returns ZERO MCP Server Cards across ALL competitors, **DO NOT immediately skip Steps 5-6.** Per `PATTERN-url-verification.md` § Categorical-zero case, the absence is on DISCOVERY surface only — capability may still exist via alternative channels. Check FIRST:

1. **Content dashboard URLs** — does any vendor's sitemap surface URLs matching `*/mcp-server/*`, `*/mcp/*`, `*/developers/ai/*`, `*/agent-toolkit/*`?
2. **npm registry** — does any vendor publish `@{vendor}/mcp-server`, `{vendor}-mcp`, `mcp-{vendor}` packages?
3. **GitHub search** — does any vendor have `{vendor}-mcp` or `mcp-{vendor}` repos?

If ANY vendor has alt-channel signal → proceed to Steps 5-6 to probe their `api.{domain}/v1/mcp`, `mcp.{domain}` etc. via JSON-RPC POST. Real MCP servers often live at API endpoints without `/.well-known/mcp` mount.

**Only after the alt-channel check returns genuinely ZERO signal everywhere** → skip Steps 5-6 and record finding as: "Categorical zero MCP adoption in [category]. No JSON-RPC verification needed. First-mover whitespace open."

This is itself the strategic signal — surface in output as "first-mover whitespace" recommendation. Skip to Step 7 (synthesis).

**Empirical basis:** in a real-world validation run, the well-known-path scan returned 0 MCP Server Cards across 8 vendors (categorical-zero on discovery). One vendor's content dashboard surfaced a documentation page URL pattern. Probing the corresponding `api.{vendor}.com/v1/mcp` endpoint via JSON-RPC POST returned a JSON-RPC error response (HTTP 401, "Authorization required") — **REAL MCP server, auth-gated, not discoverable via well-known path.** Without this check, the briefing would have shipped a false categorical-zero claim AND missed the canonical convergence paragraph competitor finding.

### Step 5: JSON-RPC POST verification for each MCP candidate URL (THE VALUE-ADD — only run if Step 4 surfaced ≥1 candidate)

This is non-negotiable. Browser GET 200 does NOT prove MCP exists — the URL could be a placeholder, parking page, or real MCP returning HTML to non-protocol clients.

For each candidate MCP URL, use Bash:

```bash
curl -sS -X POST "<candidate-url>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --max-time 15 \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"competlab-verify","version":"1.0"}}}'
```

Interpret per `PATTERN-url-verification.md` § Step M2:

| Response | Verdict |
|---|---|
| 200 + JSON body with `"jsonrpc":"2.0"` + `"result"` | **REAL MCP server (no-auth)** |
| 401/403 + JSON-RPC error body (e.g., `"Authorization required"`, code -32xxx) | **REAL MCP server (auth-gated)** |
| 404 + HTML "Cannot POST /" | NOT MCP (Express server, no MCP routing) |
| 403 + CDN error ("method not allowed" / "cacheable only") | NOT MCP (CDN config prohibits POST) |
| 405 Method Not Allowed | INCONCLUSIVE — flag for manual review |
| Network error / timeout | URL doesn't actually serve — drop |

### Step 6: For verified-real MCP servers, enumerate tool surface

```bash
curl -sS -X POST "<verified-mcp-url>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

If auth-gated, the response will say "Authorization required" — that's fine; use `mcp__competlab__fetch_url` (cleanHtml:true) to read the documentation page (typically at `/developers/.../mcp-server/` or `mcp.{domain}/docs`) and extract the tool list.

### Step 7: Synthesize per-vendor + cross-vendor

Per vendor (informed by both the platform's 25-check scan + your JSON-RPC verification):
- **Agent-Adoption Specification score** (from platform scan)
- **MCP server verdict** (JSON-RPC verified): REAL / NOT (with reason) / NOT TESTED (no URL surfaced by scan)
- **MCP tool surface** (if real, list documented tools)
- **AI crawler access** (from check_ai_crawlers): which AI bots are allowed / blocked
- **Other agent surfaces detected by platform** (Claude Skills directories, agent-toolkit GitHub repos, etc.)
- **Verdict:** Production-class / Beta / Reserved-URL-not-shipped / None

Cross-vendor:
- X of N vendors have JSON-RPC-verified MCP servers
- Trajectory comparison to other categories (payments 5/9, CRM 1/4, uptime monitoring 2/9, email warmup 0/12, CS/retention 1/8)
- Strategic gap analysis (who's behind, who's first-mover, where's whitespace)

## Output Structure

```
# Agent Adoption — [Category / Project]
> Generated [date] | Source: CompetLab platform 25-check Agent-Adoption Scan + JSON-RPC POST MCP verification

## Summary
[X of N vendors have JSON-RPC-verified MCP servers; trajectory context]

## Per-competitor
### [Competitor Name]
- **Agent-Adoption Score (platform):** [N/100, breakdown by 4 categories]
- **MCP server:** [REAL — URL + tools + auth] / [NOT — verification reason] / [NOT TESTED — no candidate URL detected]
- **AI crawler access:** [GPTBot allowed/blocked, ClaudeBot allowed/blocked, etc.]
- **Other agent surfaces:** [Claude Skills, agent-toolkit repos, etc. from platform scan]
- **Verdict:** [Production / Beta / Reserved / None]

## Cross-competitor patterns
[Adoption ranking, strategic gap, first-mover identification]

## Verification methodology note
[Platform's 25-check scan was Stage 1; JSON-RPC POST verification was Stage 2 value-add]
```

## What NOT To Do

- **Don't bypass the platform scan and DIY-probe candidate URLs.** The platform's 25-check scan is comprehensive; this skill ADDS verification on top, doesn't replace.
- **Don't report platform-scan "MCP detected" as verified MCP.** Detection is Stage 1; JSON-RPC POST verification is Stage 2. Both required for a real claim.
- **Don't include AI-crawler signals as "agent adoption."** They're related but distinct. AI crawlers consume content; agents call actions. Surface both, label clearly.
- **Don't list `/llms.txt` as agent infrastructure.** `llms.txt` is an AI-CRAWLER preference declaration (similar to robots.txt for LLMs), NOT an agent endpoint. Different concept. If `/llms.txt` is interesting for the briefing, it belongs in the AI-crawler access signal via `check_ai_crawlers`, not agent-adoption.

## Decision Questions

1. *"Should we surface our MCP server presence in homepage messaging, or keep it as developer-only surface?"* — affects positioning recommendations
2. *"What's our agent-developer hiring posture — do we have engineers who can ship an MCP server in 1-2 weeks?"* — affects timeline recommendations
3. *"Are we positioning as an AI-agent-native platform OR as a layer/tool that complements existing platforms?"* — affects which MCP tool surface to expose

## Error Handling

- **Underlying scan returns no result or times out for a competitor:** record as "Agent Adoption signal unavailable for {vendor} in this run." If the broader pattern suggests bot-protection (other dimensions also returning thin data for the same vendor), surface that as a customer-facing finding — bot-protection in 2026 means invisible to AI training crawlers + agent toolkits + comparison-engine bots, which is itself competitive intelligence about the vendor's discoverability posture.
- **JSON-RPC POST returns 5xx:** retry once; if persistent, flag as inconclusive
- **GitHub API rate limit (60/hr unauth):** mention in output; suggest authenticated mode if user has GH_TOKEN

## Empirical reference

Internal validation runs demonstrated this skill's methodology against real vendor URLs:
- **REAL MCP server confirmed:** documentation page detected at `{domain}/developers/ai/mcp-server/`; JSON-RPC POST initialize against the actual API endpoint `api.{domain}/v1/mcp` returned `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Authorization required"}}` (HTTP 401) — JSON-RPC error body proves the server speaks the protocol.
- **FALSE-POSITIVE 1 caught:** vendor reserved `mcp.{domain}` subdomain (GET returned 200 + "Domain not found" HTML); JSON-RPC POST returned 404 + `"Cannot POST /"` (Express error) → NOT MCP.
- **FALSE-POSITIVE 2 caught:** vendor reserved `developers.{domain}/mcp` URL (GET returned 200 + empty HTML); JSON-RPC POST returned 403 + CloudFront "method not allowed" → NOT MCP (CDN-fronted cache-only path).

Without the JSON-RPC verification step, 2 of 3 MCP claims would have shipped to customer briefings as false positives. The skill's value-add is real.
