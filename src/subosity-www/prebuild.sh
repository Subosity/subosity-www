#!/bin/bash

# Prebuild script for Gatsby site
# Generates version info and updates security files

set -euo pipefail

# --- Colors ---
CYAN='\033[36m'
GREEN='\033[32m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${CYAN}[*] Running prebuild tasks${RESET}"

# Generate version
echo -e "${GREEN}[+] Generating version information${RESET}"
TIMESTAMP=$(date '+%Y.%m%d.%H%M')
SHORT_SHA=$(git rev-parse --short HEAD)
VERSION="v${TIMESTAMP}-${SHORT_SHA}"
BUILD_DATE=$(date -u '+%Y-%m-%dT%H:%M:%S.000Z')
EXPIRES_DATE=$(date -u -d '+1 year' '+%Y-%m-%dT%H:%M:%S.000Z')

# Create version file in static directory
echo "${VERSION}" > ./static/version.txt
echo -e "${BLUE}[i] Version: ${VERSION}${RESET}"

# Update security.txt with dynamic dates
echo -e "${GREEN}[+] Updating security.txt${RESET}"
cat > ./static/.well-known/security.txt << EOF
Contact: mailto:security@subosity.com
Expires: ${EXPIRES_DATE}
Preferred-Languages: en
Canonical: https://subosity.com/.well-known/security.txt
CSAF: https://subosity.com/.well-known/provider-metadata.json
Policy: https://subosity.com/.well-known/security-policy.txt
EOF

# Update provider-metadata.json with current version and date
echo -e "${GREEN}[+] Updating provider-metadata.json${RESET}"
cat > ./static/.well-known/provider-metadata.json << EOF
{
  "document": {
    "category": "csaf_security_advisory",
    "csaf_version": "2.0",
    "publisher": {
      "category": "vendor",
      "name": "Subosity",
      "namespace": "https://subosity.com"
    },
    "title": "No Known Security Issues Advisory",
    "tracking": {
      "current_release_date": "${BUILD_DATE}",
      "id": "SUBOSITY-$(date '+%Y')-001",
      "initial_release_date": "${BUILD_DATE}",
      "revision_history": [
        {
          "date": "${BUILD_DATE}",
          "number": "${VERSION}",
          "summary": "Automated build ${VERSION}"
        }
      ],
      "status": "final",
      "version": "${VERSION}"
    }
  },
  "product_tree": {
    "branches": [
      {
        "name": "Subosity",
        "category": "vendor",
        "branches": [
          {
            "name": "Subosity Platform",
            "category": "product_name",
            "product": {
              "name": "Subosity Platform ${VERSION}",
              "product_id": "SUBOSITY-PLATFORM-${VERSION}"
            }
          }
        ]
      }
    ]
  },
  "vulnerabilities": [],
  "notes": [
    {
      "category": "general",
      "text": "As of ${BUILD_DATE}, there are no known security issues with this product version ${VERSION}.",
      "title": "Security Status"
    }
  ]
}
EOF

echo -e "${GREEN}[+] Prebuild tasks completed${RESET}"
