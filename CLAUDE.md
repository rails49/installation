# installation

gate: scripts/check.sh

The gate is one script with one exit code. It checks what the repository
holds: shellcheck over every shell script, `docker compose config` over every
compose file. A check arrives with the thing it checks, so a new kind of file
adds a section to `scripts/check.sh` in the same commit.

A test or check that needs hardware, a local service or a secret must skip
itself when the `CI` environment variable is set. That is the whole contract
between the gate run on a box and the gate run on a PR.

`main` only moves by pull request with the `ci` check green. Work on a branch
in a worktree, then:

    git push origin <branch> && gh pr create --fill --head <branch> && gh pr merge <branch> --auto --rebase

What each kind of doc holds, this file included, follows [rails49/.github ADR-0025](https://github.com/rails49/.github/blob/main/docs/adr/0025-each-fact-has-one-owner-and-an-adr-is-written-after-its-decision-has-run.md).

## Agent skills

The rules every rails49 repository shares are the organisation's
[`docs/agents/`](https://github.com/rails49/.github/tree/main/docs/agents):
`issue-tracker.md`, `triage-labels.md` and `domain.md`.

- Issue tracker: GitHub Issues on rails49/installation, via the `gh` CLI.
- Triage labels: `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`, `wontfix`.
- Domain docs: `GLOSSARY.md` and `docs/adr/` at the repo root.
