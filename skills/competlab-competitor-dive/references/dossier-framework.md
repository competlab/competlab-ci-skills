# Competitor Dossier Framework

> Reference for the competlab-competitor-dive skill. SWOT methodology and analysis heuristics.

---

## SWOT Analysis Methodology

A good SWOT analysis is evidence-based, specific, and actionable. Each item must answer "so what?" for the user.

### Strengths (what they do well — evidence-backed)

Look for:
- **Market traction signals:** High G2 review counts (100+ = established), strong ratings (4.5+/5), named enterprise customers
- **Product maturity:** Rich feature set, API/integrations ecosystem, stable uptime, active changelog
- **Content authority:** High content volume, ranking for target keywords, thought leadership presence
- **Pricing power:** Ability to charge premium, evidence of price increases without churn
- **AI Visibility:** High mention rate by AI models, present in AI recommendations
- **Trust signals:** SOC2, GDPR, security certifications, enterprise trust markers
- **Team strength:** Key hires from industry leaders, growing headcount, executive experience

### Weaknesses (where they're vulnerable — specific gaps)

Look for:
- **Security gaps:** Missing security headers, low trust signal count, no compliance certifications
- **Product gaps:** No API, no integrations, limited features in specific areas
- **Content gaps:** Missing content categories (no blog, no docs, no case studies)
- **Pricing issues:** Overly complex pricing, no free trial, hidden costs, price-to-value mismatch
- **AI Invisibility:** Low or zero AI mention rate on specific providers
- **Customer complaints:** Recurring themes in negative reviews (G2 cons, Reddit complaints)
- **Technical debt signals:** Outdated tech stack, slow site, broken pages

### Opportunities (how the USER can exploit this — actionable)

Transform weaknesses into user actions:
- "They lack [X] → Build [X] and emphasize it in positioning"
- "Their customers complain about [Y] → Address [Y] in your product and reference it in sales"
- "They're invisible on [provider] → Create content optimized for that AI provider"
- "Their pricing is [high/complex] → Offer simpler/lower pricing as alternative"
- "They have no [content type] → Become the authority in that content category"

### Threats (what they could do — realistic risk assessment)

Assess based on evidence:
- **Funding-driven expansion:** Recent fundraise → expect marketing/sales push
- **Product convergence:** Building features in your space → direct competition increasing
- **Content acceleration:** Ramping up publishing → SEO/AI visibility competition
- **Market positioning shift:** Moving toward your ICP → fighting for same buyers
- **Pricing aggression:** Free tier, undercut pricing → race to bottom risk
- **Acquisition/partnership:** Joining forces with complementary product → bundled offering

---

## Evidence Quality Standards

| Evidence Type | Strength | Example |
|---------------|----------|---------|
| CompetLab monitoring data | Highest — structured, timestamped, comparable | "AI Visibility Score: 45, down from 52 last month" |
| G2/Capterra aggregate data | High — large sample, verified reviewers | "4.3/5 on G2 across 187 reviews, recurring complaint: onboarding complexity" |
| Financial data (Crunchbase, press) | High — factual, verifiable | "Series B: $25M from Acme Ventures, March 2026" |
| Product pages (via WebFetch) | Medium-high — current but self-reported | "Homepage claims 'Used by 500+ companies' — no named logos visible" |
| Social mentions (Reddit, X) | Medium — individual opinions, may not be representative | "3 Reddit threads in r/saas mentioning slow support response times" |
| Inference from data | Lower — label as interpretation | "Content velocity increase (12 posts/month → 25) suggests dedicated content hire" |

Always cite your evidence type. "Competitor appears to be struggling with retention" means nothing. "Competitor's G2 reviews dropped from 4.5 to 4.1 in 6 months, with 8 of the last 15 reviews mentioning pricing concerns" is intelligence.

---

## Output Format Options

After generating the dossier, offer the user output format choices:

- **Markdown in chat** (default) — immediate, scannable, copy-pasteable
- **Standalone HTML page** — styled, with expandable sections and data tables. Write to a file the user specifies. Good for sharing with team members or embedding in internal wikis.
- **PDF-ready markdown** — structured with page breaks and print-friendly formatting

Ask: "I've generated the dossier. Would you like it as markdown here in chat (default), or as a styled HTML page you can share?"

Only ask about format if the output is substantial (dossier-length). For quick summaries, just output markdown.
