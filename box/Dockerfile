# The box's own requests and its status page: stock node, whose util-linux
# carries `nsenter`, with the Docker CLI, compose and buildx added, the
# script, and the status page built in a stage of its own. compose.yaml says
# what it runs. The same image is `rails49-update`, which updates the box and
# goes back (`box/update.mjs`): buildx builds JMRI, and curl and the probe
# check the box after it.
#
# The stock image is pinned by digest, which a release's manifest records. A
# newer one is a change to both FROM lines.

# The status page (`status-page/`), built with the commit baked in. Only
# `dist/` leaves this stage.
FROM node:22-slim@sha256:18052396bf1d0c6e0a8c58181b5c1457da19409efbd5032a3f4d86974e74d13c AS status-page
WORKDIR /status-page
# pnpm at the version `package.json` names.
RUN corepack enable
# The dependencies in a layer of their own, ahead of the sources.
COPY status-page/package.json status-page/pnpm-lock.yaml status-page/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY status-page/ ./
# `tsc --noEmit && vite build`, which bakes the commit into the page.
ARG INSTALLATION_COMMIT=
RUN pnpm run build

FROM node:22-slim@sha256:18052396bf1d0c6e0a8c58181b5c1457da19409efbd5032a3f4d86974e74d13c

# The CLI, compose and buildx from Docker's own apt repository, for the Debian
# release the stock image is built on (#65 decision 7).
ADD --chmod=644 https://download.docker.com/linux/debian/gpg /etc/apt/keyrings/docker.asc
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin docker-buildx-plugin \
 && rm -rf /var/lib/apt/lists/*

COPY box/ /box/
COPY --from=status-page /status-page/dist/ /status-page/dist/
COPY scripts/probe.sh /scripts/probe.sh

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
