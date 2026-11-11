# The box's own two requests: stock node, whose util-linux carries `nsenter`,
# with the script in it. compose.yaml says what it runs.
FROM node:22-slim

COPY box/ /box/

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
