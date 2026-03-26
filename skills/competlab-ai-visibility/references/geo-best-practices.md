# GEO Best Practices — AI Visibility Optimization

> Reference guide for the competlab-ai-visibility skill. Read this when formulating recommendations.
> These techniques are based on published research and observed patterns in AI model behavior.

---

## How AI Models Discover and Rank Brands

AI language models form brand associations during training and through retrieval-augmented generation (RAG). The key factors that influence whether an AI model mentions your brand:

### 1. Content Authority & Volume
- **Extensive, high-quality documentation** — models favor brands with rich, well-structured docs
- **Blog content that answers real questions** — AI models pull from content that directly addresses user queries
- **Technical depth** — shallow marketing pages get less weight than substantive technical content
- **Freshness signals** — regularly updated content ranks higher in RAG systems

### 2. Third-Party Mentions
- **Review platforms** (G2, Capterra, TrustRadius) — high review count and rating = more AI mentions
- **Comparison articles** — "X vs Y" content directly shapes AI recommendation responses
- **Industry publications** — mentions in respected outlets build brand association
- **Community discussions** (Reddit, HN, Stack Overflow) — organic mentions carry high weight
- **Wikipedia presence** — still a major source for AI training data

### 3. Technical Integration Signals
- **API documentation** — brands with public APIs get recommended for technical use cases
- **MCP servers / AI tool integrations** — direct presence in AI ecosystems
- **npm/pip packages** — publishable SDK = automatic discoverability by code-focused AI
- **GitHub presence** — stars, forks, activity signal relevance

### 4. Structured Data & Schema
- **Schema.org markup** — helps AI understand what your product does
- **FAQ structured data** — directly maps to query-answer patterns AI models use
- **Product/SoftwareApplication schema** — categorizes your tool for AI
- **OpenGraph and meta descriptions** — still consumed by crawlers that feed AI training

### 5. Brand Distinctiveness
- **Unique terminology** — brands that own specific terms get mentioned when those terms come up
- **Clear category positioning** — "the X for Y" framing that AI can easily retrieve
- **Consistent messaging across channels** — reduces ambiguity in AI model associations

---

## Actionable GEO Techniques (prioritized by impact)

### High Impact, Low Effort
1. **Optimize your homepage meta description and H1** — this is what crawlers index first
2. **Add FAQ schema to your landing page** — directly maps to AI Q&A retrieval
3. **Ensure G2/Capterra profiles are complete and actively collecting reviews** — major AI training source
4. **Write comparison pages** ("YourBrand vs Competitor") — shapes AI recommendation logic
5. **Publish a "What is [your category]?" definitive guide** — positions you as the authority

### High Impact, Medium Effort
6. **Build and publish an MCP server** — direct integration into AI tool ecosystems
7. **Create comprehensive API documentation** — signals technical maturity
8. **Publish open-source tools/libraries** — GitHub presence compounds
9. **Write guest posts for industry publications** — third-party authority signals
10. **Get listed on major comparison/directory sites** — breadth of mentions matters

### Medium Impact, Strategic
11. **Submit to AI-specific directories** (there.pm, ai-search.io, etc.)
12. **Create a Wikipedia page** (if notable enough) — training data source
13. **Sponsor or participate in AI-focused communities** — Reddit, Discord, forums
14. **Produce case studies with named customers** — specific, quotable content
15. **Build public artifacts** (calculators, benchmarks, reports) — linkable, citable content

---

## Interpreting CompetLab AI Visibility Scores

- **AI Visibility Score (0-100):** Weighted composite of mention rate, ranking position, and sentiment across all providers. Higher = more visible to AI.
- **Mention Rate:** Fraction of monitored queries where the brand appears in AI responses. A rate of 0.67 means the brand is mentioned in 2 out of 3 queries.
- **Per-Provider Scores:** Each AI provider (OpenAI, Claude, Gemini) may rank brands differently based on their training data, RAG sources, and weighting. Divergence between providers reveals which AI ecosystems you're strong/weak in.

### Score Interpretation Guide
| Score Range | Interpretation |
|-------------|---------------|
| 70-100 | Dominant — AI models consistently recommend this brand |
| 50-69 | Strong — mentioned frequently, but not always first |
| 30-49 | Moderate — appears in some queries, absent from others |
| 10-29 | Weak — rarely mentioned, usually below competitors |
| 0-9 | Invisible — AI models don't associate this brand with the category |

### Trend Interpretation
- **Rising 10+ points in 30 days:** Significant momentum — something changed (content push, PR, new integrations)
- **Declining 10+ points:** Concerning — investigate what competitors did or what content was lost
- **Stable but low:** Opportunity — the brand hasn't invested in AI visibility yet
- **Volatile (large swings):** AI models are uncertain about this brand — inconsistent or conflicting signals
