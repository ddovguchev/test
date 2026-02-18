#!/usr/bin/env bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DRY_RUN=false
ASSUME_YES=false
AGGRESSIVE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -y|--yes)
      ASSUME_YES=true
      shift
      ;;
    -a|--aggressive)
      AGGRESSIVE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -d, --dry-run      Show commands without executing"
      echo "  -y, --yes          Do not ask for confirmation"
      echo "  -a, --aggressive   Also clear broader user caches"
      echo "  --help             Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0"
      echo "  $0 --aggressive"
      echo "  $0 --dry-run"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage."
      exit 1
      ;;
  esac
done

cd "$(dirname "$0")"

NIX_CMD="nix --extra-experimental-features 'nix-command'"

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] $cmd"
  else
    eval "$cmd"
  fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧹 NixOS cleanup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "This will:"
echo "  - clean Nix generations and unreferenced store paths"
echo "  - optimize Nix store"
echo "  - clean user caches and temporary files"
if [[ "$AGGRESSIVE" == true ]]; then
  echo "  - aggressively clean additional cache directories"
fi
echo ""

if [[ "$ASSUME_YES" == false && "$DRY_RUN" == false ]]; then
  read -r -p "Continue? [y/N] " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

echo ""
echo -e "${BLUE}🗑️  Cleaning user temp/cache...${NC}"
run_cmd "rm -rf \"$HOME/.cache\"/*"
run_cmd "rm -rf \"$HOME/.local/state/nix/profiles\"/*-link"
run_cmd "rm -rf \"$HOME/.nv/ComputeCache\"/*"
run_cmd "rm -rf \"$HOME/.cache/thumbnails\"/*"

if [[ "$AGGRESSIVE" == true ]]; then
  run_cmd "rm -rf \"$HOME/.mozilla/firefox\"/*/cache2/*"
  run_cmd "rm -rf \"$HOME/.config/google-chrome/Default/Cache\"/*"
  run_cmd "rm -rf \"$HOME/.config/chromium/Default/Cache\"/*"
fi

echo ""
echo -e "${BLUE}📦 Cleaning Nix user generations...${NC}"
run_cmd "$NIX_CMD profile wipe-history --profile /nix/var/nix/profiles/per-user/$USER/profile --older-than 7d || true"
run_cmd "nix-collect-garbage -d"

echo ""
echo -e "${BLUE}🛠️  Cleaning system generations (sudo)...${NC}"
run_cmd "sudo $NIX_CMD profile wipe-history --profile /nix/var/nix/profiles/system --older-than 7d || true"
run_cmd "sudo nix-collect-garbage -d"
run_cmd "sudo $NIX_CMD store gc"
run_cmd "sudo $NIX_CMD store optimise"

echo ""
echo -e "${BLUE}🧽 Cleaning temporary directories...${NC}"
run_cmd "sudo rm -rf /tmp/*"
run_cmd "sudo rm -rf /var/tmp/*"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} run './rebuild.sh' after cleanup if needed."
