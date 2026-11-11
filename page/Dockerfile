# The page: stock nginx with the render script and look's bundle in it.
# compose.yaml says what it runs: render once at start, then nginx.
#
# The stock image is pinned by digest, which a release's manifest records. A
# newer one is a change to this line.
FROM nginx:alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11

COPY page/ /page/
COPY look/ /usr/share/nginx/html/look/

# The commit this was built from, which compose also names the image by.
# Empty when no commit was named.
ARG INSTALLATION_COMMIT=
LABEL org.opencontainers.image.revision=$INSTALLATION_COMMIT
LABEL org.opencontainers.image.source=https://github.com/rails49/installation
