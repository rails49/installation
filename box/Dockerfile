# The box's own requests and its status page: stock node, whose util-linux
# carries `nsenter`, with the Docker CLI and compose added, the script, and
# look's bundle for the page. compose.yaml says what it runs.
#
# The stock image is pinned by digest, which a release's manifest records. A
# newer one is a change to this line.
FROM node:22-slim@sha256:18052396bf1d0c6e0a8c58181b5c1457da19409efbd5032a3f4d86974e74d13c

# The CLI and compose from Docker's own apt repository, for the Debian release
# the stock image is built on (#65 decision 7).
ADD --chmod=644 https://download.docker.com/linux/debian/gpg /etc/apt/keyrings/docker.asc
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
 && rm -rf /var/lib/apt/lists/*

COPY box/ /box/
COPY look/ /look/

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
