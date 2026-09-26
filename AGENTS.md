# CompetLab Agent Skills

This repository contains competitive intelligence skills following the [Agent Skills](https://agentskills.io) open standard.

Every skill here READS through the CompetLab MCP server and shapes what comes back into something a
human can act on — six of them read a project's monitoring data, and `competlab-site-audit` reads a
bare domain through the free scans. None of them run their own market research: the platform does the
monitoring, the skills do the reading and the writing.

## What the platform monitors

CompetLab monitors **6 dimensions** across a project's competitors:

1. **AI Visibility** — which companies the AI engines name in answer to the project's **3 prompts**, and whether the customer is one of them
2. **AI Sources** — which pages the engines retrieved while answering the project **8 buying questions**, per engine
3. **Positioning** — how competitors describe themselves and to whom
4. **Pricing Intelligence** — plans, prices, packaging and how they change
5. **Content Intelligence** — what competitors publish and when
6. **Tech & Trust Profile** — stack, security posture and trust signals

AI Visibility asks the project's 3 prompts across **5 engines**: ChatGPT, Claude, Gemini, Perplexity,
and Google AI Overviews. **Nothing here is positional.** The engines are not asked to order anything
and none of them publish a placement, so brand order is by **presence** — how often a brand is named
— and by nothing else. Google AI Overviews is a results page rather than a chat model: it names
companies in prose and ranks nothing.

The **8 buying questions** belong to AI Sources alone — one per fixed buying intent, generated for the project rather than written by the user. They are not user-editable, they are a
different prompt set from AI Visibility's 3, and the two dimensions share no data.

## Available Skills

- **competlab-ai-visibility** — reads the AI Visibility dimension and reports which companies the five engines name in the category, and whether the brand is one of them
- **competlab-ai-sources** — reads the AI Sources dimension and reports, per engine, which retrieved pages named other companies and which named the brand
- **competlab-briefing** — reads the platform's own Strategic Briefing across its 14 analysis areas, at the depth the question needs. It reads the briefing; it does not rebuild the analysis
- **competlab-competitor-dive** — builds a dossier on a single monitored competitor from every dimension the platform holds on it
- **competlab-battlecard** — turns the same monitoring data into a sales-ready battlecard with objection handling
- **competlab-site-audit** — audits a site as engines and crawlers meet it: crawler access, sitemap coverage, tech and trust signals. Runs on any public domain, with or without a project
- **competlab-monitoring-setup** — reviews how a project is configured — the competitor roster, the AI Visibility prompts, the per-dimension schedules — and recommends what to change. It carries no write tools and changes nothing itself

## Requirements

1. **The CompetLab MCP server, configured with an API key.** Every skill here needs it, including
   `competlab-site-audit` — every tool in this repo lives on the authenticated server, the free scans
   included. A free-trial key is enough, and a read-only key covers everything.
2. **An active CompetLab project** with competitors configured — for every skill except
   `competlab-site-audit`.

`competlab-site-audit` is the exception. Its Mode A takes a bare domain: **no project, no monitored
competitors** — the API key is the only requirement. Mode B adds a project and cross-checks the
customer's own site against what the monitored dimensions managed to read from it.

### MCP server connection

| | |
|---|---|
| Endpoint | `https://mcp.competlab.com/mcp` |
| Transport | Streamable HTTP |
| Auth header | `CL-API-Key` |
| Key format | begins `cl_live_` |
| Tools exposed | 48 |

`https://competlab.com/developers/mcp` is the **setup documentation page**, not the endpoint. Point
a client at `https://mcp.competlab.com/mcp`.

## Installation

```bash
npx skills add competlab/competlab-ci-skills --all
```

Skills are located in `skills/<skill-name>/SKILL.md` and follow the Agent Skills specification.
