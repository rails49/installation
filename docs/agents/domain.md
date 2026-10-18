# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. This is a single-context repo.

## Before exploring, read these

- `CONTEXT.md` at the repo root: the glossary.
- `docs/adr/`: read ADRs that touch the area you're about to work in.

If either doesn't exist, proceed without comment. Don't flag the absence and don't suggest creating them upfront. The `/domain-modeling` skill creates them when terms or decisions get resolved.

What each kind of doc holds — the glossary, an ADR, the README, `CLAUDE.md` — is set by [rails49/.github ADR-0017](https://github.com/rails49/.github/tree/main/docs/adr); a `CONTEXT.md` entry that restates a term `.github`'s `CONTEXT.md` owns links there instead.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary rejects.

If the concept you need isn't in the glossary yet, either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, say so rather than overriding it:

> _Contradicts ADR-NNNN (<title>), but worth reopening because…_
