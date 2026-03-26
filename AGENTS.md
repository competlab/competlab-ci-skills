# CompetLab AI Skills

This repository contains competitive intelligence skills following the [Agent Skills](https://agentskills.io) open standard.

## Available Skills

- **competlab-ai-visibility** — Analyzes how AI models (ChatGPT, Claude, Gemini) mention and rank brands
- **competlab-weekly-briefing** — Generates weekly competitive intelligence briefings from monitoring data
- **competlab-competitor-dive** — Builds comprehensive competitor dossiers with SWOT analysis
- **competlab-battlecard** — Generates sales-ready competitive battlecards with objection handling
- **competlab-landscape** — Full competitive landscape analysis with market dynamics and strategic recommendations

## Requirements

These skills require:
1. **CompetLab MCP server** configured with an API key ([setup guide](https://competlab.com/developers/mcp))
2. **An active CompetLab project** with competitors configured
3. **Web access** (WebSearch/WebFetch) for live market research (optional but recommended)

## Installation

```bash
npx skills add competlab/competlab-ci-skills --all
```

Skills are located in `skills/<skill-name>/SKILL.md` and follow the Agent Skills specification.
