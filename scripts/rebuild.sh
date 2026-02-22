#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "Updating flake from Git..."
git pull --rebase

echo "Rebuilding NixOS and Home Manager..."
sudo nixos-rebuild switch --flake .
home-manager switch --flake .

echo "✅ Rebuild complete!"

