#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ACTION="switch"
HOST="nixos"
DRY_RUN=false

cd "$(dirname "$0")"

# Check if running as root for switch/boot actions
if [[ "$ACTION" == "switch" || "$ACTION" == "boot" ]]; then
  if [[ $DRY_RUN == false && $EUID -ne 0 ]]; then
    echo -e "${YELLOW}Note: This action requires sudo privileges${NC}"
  fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Rebuilding NixOS configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Host: ${GREEN}$HOST${NC}"
echo -e "Action: ${GREEN}$ACTION${NC}"
echo -e "Dry run: ${GREEN}$DRY_RUN${NC}"
echo ""

if [[ $DRY_RUN == true ]]; then
  echo -e "${YELLOW}🔍 Dry run mode - showing what would be executed:${NC}"
  echo "sudo nixos-rebuild $ACTION --flake .#$HOST --option warn-dirty false"
  echo ""
  echo -e "${YELLOW}To actually rebuild, run without --dry-run${NC}"
  exit 0
fi

# Format nix files before rebuild
if command -v nix &> /dev/null; then
  echo -e "${BLUE}📝 Formatting Nix files...${NC}"
  if nix fmt . >/dev/null 2>&1; then
    :
  elif command -v nixpkgs-fmt >/dev/null 2>&1; then
    nixpkgs-fmt . >/dev/null 2>&1 || true
  else
    echo -e "${YELLOW}⚠️  nix fmt not available, skipping${NC}"
  fi
  echo ""
fi

# Execute rebuild
echo -e "${BLUE}🔨 Building configuration...${NC}"
if sudo nixos-rebuild $ACTION --flake .#$HOST --option warn-dirty false; then
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ NixOS configuration successfully applied!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}💡 Tip: Press F12 to switch between English and Russian keyboards${NC}"
  
  if [[ "$ACTION" == "boot" ]]; then
    echo -e "${YELLOW}💡 Configuration will be available on next boot${NC}"
  fi
else
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Rebuild failed!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}💡 Tips for debugging:${NC}"
  echo "  - Check the error messages above"
  echo "  - Run 'nix flake check' to validate the flake"
  echo "  - Run 'sudo nixos-rebuild switch --flake .#$HOST --option warn-dirty false --show-trace' for detailed errors"
  exit 1
fi
