# The stock image, with its `jmri` user renumbered to the person who deployed
# the box. JMRI's profile lives in `control`'s store, which runs as that person
# and whose restore writes files as them; under the image's own 61000 JMRI could
# not write its roster again afterwards (rails49/.github ADR-0013). The image
# fixes the uid at build time and reads nothing at runtime to change it.
#
# The stock image is pinned by digest, so every box builds on the same one. A
# newer one is a change to this line.
FROM jsa1987/jmri-docker:stable@sha256:1764d0e974de61bb05191bb42d53f8fb6d1ce442ca0ec8494d66576f49e61f2f

ARG TC49_UID=1000
ARG TC49_GID=1000

USER root
RUN groupmod -o -g "$TC49_GID" jmri \
 && usermod -o -u "$TC49_UID" -g "$TC49_GID" jmri \
 && chown -R jmri:jmri /home/jmri /src /var/opt/jmri-default /var/opt/Desktop-default
USER jmri
