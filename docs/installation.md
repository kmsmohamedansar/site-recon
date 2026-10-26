# Installation

Site Recon is a portable Agent Skill. Install the entire directory so the agent can read `SKILL.md`, run the inspector, and use the bundled references and clean-room starter assets.

## Requirements

- Node.js 20 or newer for the automated inspector
- Codex or Claude Code
- Playwright and its Chromium runtime for full browser automation

The written skill can still guide an agent when Playwright is unavailable.

## Codex

Project installation:

```bash
mkdir -p .agents/skills
cp -R /path/to/site-recon .agents/skills/site-recon
```

Personal installation for local projects:

```bash
mkdir -p ~/.agents/skills
cp -R /path/to/site-recon ~/.agents/skills/site-recon
```

Ask Codex naturally, for example:

```text
Use Site Recon to inspect https://example.com. Explain the stack and every
important animation, then build an original React version of the interaction.
```

## Claude Code

Project installation:

```bash
mkdir -p .claude/skills
cp -R /path/to/site-recon .claude/skills/site-recon
```

Personal installation:

```bash
mkdir -p ~/.claude/skills
cp -R /path/to/site-recon ~/.claude/skills/site-recon
```

Invoke the skill through a normal request that asks Claude Code to inspect, reverse-engineer, or rebuild a public website interaction.

## Automated inspector

```bash
cd site-recon
npm install
npx playwright install chromium
node scripts/inspect-site.mjs https://example.com \
  --out site-recon.json \
  --artifacts-dir site-recon-artifacts
```

`--timeout` accepts a navigation timeout in milliseconds when a site needs longer than the default 30 seconds.

## Updating

Replace the installed `site-recon` directory with the newer release. Keep the directory name and `name: site-recon` frontmatter unchanged so the agent continues to recognize the skill.
