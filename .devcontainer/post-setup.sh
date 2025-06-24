#!/usr/bin/env bash

# Dev Container Post-Setup Script
# Description: Configure aliases and developer experience enhancements

set -euo pipefail

# --- Colors ---
CYAN='\033[36m'
GREEN='\033[32m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${CYAN}[*] Setting up development environment${RESET}"

# Add useful aliases
echo -e "${GREEN}[+] Adding development aliases${RESET}"
cat >> "$HOME/.bashrc" << 'EOF'

# === Development Aliases ===
alias ll="ls -la"
alias gatsby-dev="npx gatsby develop --host 0.0.0.0"
alias gatsby-build="npm run build"
alias gatsby-serve="npm run serve"

show_gatsby_help() {
    echo -e "\033[36m╔══════════════════════════════════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[36m║\033[0m                          🚀 Gatsby Development Commands                      \033[36m║\033[0m"
    echo -e "\033[36m╠══════════════════════════════════════════════════════════════════════════════╣\033[0m"
    echo -e "\033[36m║\033[0m  \033[32mgatsby-dev\033[0m      Start development server (http://localhost:8000)            \033[36m║\033[0m"
    echo -e "\033[36m║\033[0m  \033[32mgatsby-build\033[0m    Build production-optimized site                             \033[36m║\033[0m"
    echo -e "\033[36m║\033[0m  \033[32mgatsby-serve\033[0m    Serve production build (http://localhost:9000)              \033[36m║\033[0m"
    echo -e "\033[36m║\033[0m                                                                              \033[36m║\033[0m"
    echo -e "\033[36m║\033[0m  \033[33mTip:\033[0m Use \033[32mgatsby-help\033[0m to show this message again                             \033[36m║\033[0m"
    echo -e "\033[36m╚══════════════════════════════════════════════════════════════════════════════╝\033[0m"
    echo
}

alias gatsby-help="show_gatsby_help"

# Show help on new terminal sessions (only if interactive)
if [[ $- == *i* ]]; then
    show_gatsby_help
fi
EOF