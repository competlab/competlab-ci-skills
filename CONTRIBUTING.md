# Contributing to CompetLab Agent Skills

Thanks for your interest in contributing!

## Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/competlab/competlab-ci-skills/issues).

When reporting a skill issue, include:
- Which skill you were using
- What you asked the agent to do
- What happened vs what you expected
- Which AI agent you're using (Claude Code, Cursor, etc.)

## Suggesting Improvements

We welcome suggestions for:
- New trigger phrases that should activate a skill
- Output format improvements
- Additional web research patterns
- New skill ideas for competitive intelligence workflows

## Skill Structure

Each skill follows the [Agent Skills](https://agentskills.io) specification:

```
skills/<skill-name>/
  SKILL.md              # Required — frontmatter + instructions
  references/           # Optional — supporting docs loaded on demand
```

Shared reference material lives in `shared/` and is copied into each skill's `references/` so that
every install path carries it. **Edit the copy in `shared/` and run `npm run sync:shared`** — never
edit a `references/` copy directly; CI checks the two match.

## Guidelines

- Keep SKILL.md under 500 lines — use `references/` for depth
- Every referenced file must exist (no reference illusions)
- `allowed-tools` must list every tool the body tells the agent to call, and nothing it does not
- Descriptions follow the pattern: `[What it does]. [When to use]. [NOT for]. [Requires].`
- Test against real CompetLab projects before submitting

### Two rules about numbers

This suite reads a product that is careful about measurement, and the skills have to be at least as
careful.

- **No statistic you cannot source.** Not "~30% of", not a rate computed from three samples, not a
  range so wide it excludes nothing. If a claim is qualitative, write it qualitatively.
- **Follow `shared/READING-THE-DATA.md`.** It is not style guidance — `null` is not zero, counts are
  not rates, and two overlapping ranges are not an ordering. A skill that breaks those rules produces
  confident, wrong output, which is worse than no output.

Avoid hardcoding vendor names as examples. They date quickly and this repo is public.

## CI

```bash
npm run check        # all three
npm run check:tools  # allowed-tools matches the body
npm run check:refs   # every referenced file exists
npm run check:facts  # product claims have not gone stale
```

`check:facts` guards a list of things that were true once and are not now — the dimension count, the
engine list, the MCP endpoint. When the product changes, update the rule table in
`scripts/check-facts.mjs` in the same pull request.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
