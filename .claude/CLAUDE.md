@../AGENTS.md

# Claude Code specifics

- Treat the imported `AGENTS.md` as the canonical repository instruction source.
- Read the relevant provider-neutral skill under `.agents/skills/` for the assigned role.
- Do not duplicate repository-wide policy here.
- Use plan mode before destructive, multi-module or persistence-format changes.
- Do not create commits or push unless explicitly requested.
