#!/bin/bash

# Generate version
TIMESTAMP=$(date '+%Y.%m%d.%H%M')
SHORT_SHA=$(git rev-parse --short HEAD)
VERSION="v${TIMESTAMP}-${SHORT_SHA}"

# Create version file in static directory (gets copied to public during build)
echo ${VERSION} > ./static/version.txt
