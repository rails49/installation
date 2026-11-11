# The box's own two requests: stock node, whose util-linux carries `nsenter`,
# with the script in it. compose.yaml says what it runs.
#
# The stock image is pinned by digest, which a release's manifest records. A
# newer one is a change to this line.
FROM node:22-slim@sha256:18052396bf1d0c6e0a8c58181b5c1457da19409efbd5032a3f4d86974e74d13c

COPY box/ /box/

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
