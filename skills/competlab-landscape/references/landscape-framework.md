# Landscape Analysis Framework

> Reference for the competlab-landscape skill. Analytical frameworks and strategic heuristics.

---

## Strategic Analysis Frameworks

### Porter's Five Forces (adapted for SaaS)

Apply these lenses when analyzing the market:

1. **Competitive Rivalry** — how intensely are current players competing? Signals: pricing pressure, feature parity, content arms race, aggressive marketing.
2. **Threat of New Entrants** — how easy is it for new competitors to enter? Signals: open-source alternatives, low switching costs, AI tools lowering build complexity.
3. **Threat of Substitutes** — what could replace the entire category? For CI: manual research, AI agents doing it ad-hoc, consultant firms, internal teams with spreadsheets.
4. **Buyer Power** — how much leverage do buyers have? Signals: many alternatives, low switching costs, free tiers available, easy data export.
5. **Supplier Power** — what dependencies exist? For SaaS: cloud costs, API dependencies, data source reliability.

### Category Lifecycle Positioning

Where is the market?

| Stage | Signals | Strategic Implication |
|-------|---------|---------------------|
| **Emerging** | Few competitors, no clear leader, funding-driven, category name not settled | Land-grab. Win by defining the category. |
| **Growing** | New entrants weekly, VC money flowing, feature expansion, market education | Differentiate. Build moat before commoditization. |
| **Maturing** | Consolidation, feature parity, price competition, established leaders | Specialize or go platform. Compete on trust and ecosystem. |
| **Consolidating** | M&A activity, vendor fatigue, "good enough" prevails | Niche or be acquired. Win on depth, not breadth. |

### Positioning Whitespace Map

To find positioning opportunities:

1. List all competitors' primary positioning claims (from CompetLab positioning data)
2. Identify clusters: which claims are overused?
3. Find gaps: what real buyer needs are NOT being addressed by anyone's messaging?
4. Evaluate: which gaps are strategically valuable? (large audience, strong buyer intent, defensible)

Common whitespace patterns in B2B SaaS:
- Everyone targets enterprise → SMB whitespace exists
- Everyone focuses on features → simplicity/UX whitespace exists
- Everyone sells to technical buyers → business buyer whitespace exists
- Everyone competes on price → premium/quality whitespace exists
- Everyone markets via content → community/product-led whitespace exists

---

## Cross-Dimensional Pattern Library

Known patterns to look for when analyzing across CompetLab's 5 dimensions:

### The Enterprise Pivot
**Signals:** Trust signal additions + pricing increase + positioning toward "enterprise" keywords
**Meaning:** Competitor is moving upmarket. They'll compete less on price, more on trust and features.
**Your play:** If you're SMB-focused, this opens space below them. If you're also going enterprise, accelerate trust-building.

### The Content Blitz
**Signals:** Content volume spike + new content categories + blog post frequency increase
**Meaning:** Competitor is investing in organic growth. Could be VC-funded growth push or new content hire.
**Your play:** Don't try to match volume — match quality and own specific topics they're ignoring.

### The Price War Starter
**Signals:** Significant price decrease + free tier introduction + aggressive CTAs
**Meaning:** Competitor is buying market share. Often follows fundraise or revenue pressure.
**Your play:** Don't follow them down. Emphasize value and quality. Their margins are suffering.

### The Stealth Builder
**Signals:** Tech stack changes + minimal public activity + reduced content
**Meaning:** Competitor is heads-down building something big. Quiet periods precede major launches.
**Your play:** Monitor closely. Prepare competitive response for what they might launch.

### The AI-First Mover
**Signals:** High AI Visibility score + API/MCP availability + AI-related content
**Meaning:** Competitor is optimizing for AI-era distribution. They'll be recommended by AI models.
**Your play:** Invest in your own AI visibility. See the competlab-ai-visibility skill for specific actions.

### The Trust Asymmetry
**Signals:** Some competitors have security A grades, SOC2, certifications while others have F grades
**Meaning:** Market is segmenting into enterprise-ready and startup-grade. Buyers will self-sort.
**Your play:** Know which segment you serve and invest in the appropriate trust signals.

---

## Market Macro Analysis Heuristics

When researching market trends via web search, focus on:

### Signals That Matter
- **VC funding patterns:** Where money flows predicts where competition grows. Track funding rounds in the category.
- **Analyst reports:** Gartner Magic Quadrants, G2 Grids, Forrester Waves position the market. These shape enterprise buying.
- **Conference themes:** What major conferences discuss this year becomes product reality next year.
- **Platform moves:** When Salesforce/HubSpot/Microsoft enters your space, the game changes. Track platform announcements.
- **Regulatory shifts:** GDPR reshaped data tools. AI regulation will reshape AI tools. Track regulatory signals.
- **Open-source momentum:** Strong open-source alternatives signal commoditization pressure.

### Signals to Weight Less
- **PR announcements without substance** — ignore "delighted to announce our partnership with..." without specifics
- **Social media hype** — LinkedIn engagement ≠ market reality
- **Self-reported metrics** — "trusted by 10,000+ companies" is marketing, not market data
- **Single data points** — one competitor's move isn't a market trend

---

## Output Calibration

The landscape report is the longest output in the skill suite. Keep it focused:

- **Executive summary: 5-7 sentences** — someone should understand the landscape from this alone
- **Market context: 300-500 words** — macro framing, not encyclopedic coverage
- **Competitive matrix: data-driven table** — numbers and grades, not prose
- **Dimension deep dives: 100-150 words each** — the highlights, not the full dashboard
- **Cross-dimensional patterns: 3-5 patterns max** — quality over quantity
- **Recommendations: 3-5 max** — the user can't execute 15 things simultaneously

Total target: 2,000-3,000 words. Long enough to be comprehensive, short enough to be read.
