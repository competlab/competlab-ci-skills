# Contributing to CompetLab AI Skills

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

## Guidelines

- Keep SKILL.md under 500 lines — use `references/` for depth
- Every referenced file must exist (no reference illusions)
- Descriptions follow the pattern: `[What it does]. [When to use]. [NOT for]. [Requires].`
- Test against real CompetLab projects before submitting

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
