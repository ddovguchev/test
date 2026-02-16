#!/usr/bin/env bash

set -e

echo "🔄 Rebuilding NixOS configuration..."
cd "$(dirname "$0")"

sudo nixos-rebuild switch --flake .#nixos

echo "✅ NixOS configuration successfully applied!"
echo "Press F12 to switch between English and Russian keyboards."
