# The page: stock nginx with the render script and look's bundle in it.
# compose.yaml says what it runs: render once at start, then nginx.
FROM nginx:alpine

COPY page/ /page/
COPY look/ /usr/share/nginx/html/look/

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
