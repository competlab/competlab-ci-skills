---
name: competlab-status-watch
description: |
  Probes each monitored competitor's public status page and recent incident history. Detects ongoing outages, recent incident frequency, post-mortem quality, and status-page-broken-or-missing as itself a signal. Critical for sales conversations (concrete reliability ammunition — specific incident with date + duration + customer-impact), competitive trust assessment, and operational-maturity reads. Use when the user asks "competitor reliability", "competitor incidents", "status page check", "operational maturity", "sales reliability ammunition vs [competitor]". Requires CompetLab MCP + Bash + `mcp__competlab__fetch_url`.
effort: low
license: MIT
allowed-tools: mcp__competlab__list_projects mcp__competlab__list_competitors Bash mcp__competlab__fetch_url
metadata:
  author: competlab
  version: "2.0.0"
  category: competitive-intelligence
---

# Status & Reliability Intelligence

You probe each monitored competitor's public status page, extract current incidents + recent 90-day incident history, and report findings as decision-grade competitive intelligence.

## Workflow

### Step 1: Identify competitors
Pull `list_projects` + `list_competitors`.

### Step 2: Probe candidate status URLs

For each competitor, try in order:
1. **Statuspage.io schema** at `status.{domain}/api/v2/status.json` and `/api/v2/incidents.json` — structured JSON, fastest signal
2. **Better Stack hosted status** at `status.{domain}` — HTML extraction
3. **Instatus** at `{domain}.instatus.com` — newer Statuspage.io alternative
4. **incident.io** — used by some vendors (e.g., Block/Square at `issquareup.com`)
5. **Sorry™** — Pingdom + Replit pattern
6. **RSS / ATOM feeds** at `paypal-status.com` style
7. **SPA Playwright-rendered status** (Stripe, Adyen, Razorpay) — note as "requires browser rendering"
8. **SAML/auth-gated** — flag when canonical `status.{vendor}.com` returns 401/403

Use Bash + curl with `--max-time 8 -A "<Chrome UA>"`.

### Step 3: For Statuspage.io schema vendors, extract structured data
```bash
curl -sS https://status.{domain}/api/v2/incidents.json | jq '.incidents[0:5] | .[] | {name, status, severity: .impact, created_at, resolved_at, components: .components}'
```

### Step 4: For HTML status pages, VERIFY content before trusting HTTP 200

**Critical anti-pattern (banked from real-world validation):** `/status` returning HTTP 200 + HTML body does NOT prove a status page exists. Common false-positives:
- Site has SPA-catchall route → `/status` returns homepage HTML
- Site has locale-based redirect → `/status` 200s but redirects to `/en/` or `/de/`

**Verification gate:** for any HTML 200 response on a status-page URL, use `mcp__competlab__fetch_url` with `cleanHtml:true` and verify ONE of:
- HTML `<title>` contains "status" / "uptime" / "incident" (case-insensitive)
- Body contains canonical incident-page schema markers (`incident-list`, `component-status`, `current-status-indicator`, `statuspage-` prefix, etc.)
- `finalUrl` after redirect still contains `/status` path (not redirected to homepage)

If NONE of these markers present → mark as SPA-catchall / no-status-page (not a real status page).

Example failure modes from a real-world validation run:
- Vendor A `/status` → 200 + HTML, but `finalUrl` redirected to `/en/` (locale-redirect false-positive — multilingual site geo-redirects to default locale)
- Vendor B `/status` → 200 + HTML, but body was homepage content (SPA-catchall false-positive — single-page-app catch-all route serves homepage at any unmapped path)

Read recent incident list from cleaned HTML only AFTER verification gate passes. Extract: incident titles, dates, severity, resolution time.

### Step 5: Synthesize per-competitor + cross-competitor

Per competitor:
- Status page exists? URL? Backend type (Statuspage.io / Sorry / custom / broken / missing)
- Current state (operational / degraded / partial outage / major outage)
- Recent 90-day incidents (count, total duration, severity mix)
- Notable recent incidents (sales-ammunition-grade — name, date, duration, impact)
- Operational maturity signal (status-page-missing OR -broken is itself a CMO-grade narrative liability)

Cross-competitor:
- Coverage breakdown (X of N vendors have public status page; Y of N use Statuspage.io)
- Reliability comparison (incident frequency, total downtime, MTTR signal)
- Operational-hygiene gaps (vendors with broken or missing status pages)

## Output Structure

```
# Status & Reliability — [Category / Project]
> Generated [date] | X of N vendors have functional public status page

## Summary
[Coverage breakdown, top sales-ammunition findings]

## Per-competitor
### [Competitor]
- **Status page:** [URL + backend type] / [BROKEN/MISSING — signal]
- **Current:** [operational / degraded / outage]
- **Recent 90d:** [N incidents, total duration]
- **Notable:** [sales-ammunition list with dates + durations + impact]

## Cross-competitor patterns
[Coverage gap, reliability comparison, hygiene gaps]

## Sales ammunition ready-to-use
[1-3 concrete data points naming a specific dated incident, duration, and customer-facing impact]
```

## Decision Questions

1. *"Do we want to reference competitor incidents in sales conversations or keep marketing-neutral?"* — affects whether to surface sales ammo
2. *"Is our own status page functional + Statuspage.io-formatted?"* — surfaces self-hygiene gap as recommendation if not

## Error Handling

- **Status page returns 404 / domain doesn't exist:** record vendor as "no public status page" — that IS the finding (transparency gap as customer-facing signal). Don't infer reliability either direction.
- **Statuspage.io API 5xx / fetch_url timeout:** retry once with 10s delay; if persistent, mark "status page detected but data unavailable" rather than dropping the vendor silently.
- **HTML content verification gate fails (SPA-catchall / locale-redirect / 200-but-empty-shell):** treat as "status page detected, content not parseable" — DON'T claim incident data from an unparsed page. This catches the common SPA + i18n trap where vendor's status URL returns HTTP 200 but actual page content is gated behind hydration.

## What NOT To Do

- Don't fabricate incident data — if status page is missing, say so.
- Don't include private/internal status URLs — only public.
- Don't over-state reliability claims for vendors with broken status pages (could be deliberately gated, not necessarily unreliable).
