# installation

gate: scripts/check.sh

The gate is one script with one exit code. It checks what the repository
holds: shellcheck over every shell script, `docker compose config` over every
compose file. A check arrives with the thing it checks, so a new kind of file
adds a section to `scripts/check.sh` in the same commit.

A test or check that needs hardware, a local service or a secret must skip
itself when the `CI` environment variable is set. That is the whole contract
between the gate run on a box and the gate run on a PR.

`main` only moves by pull request with the `ci` check green:

    git push -u origin <branch> && gh pr create --fill && gh pr merge --auto --rebase
