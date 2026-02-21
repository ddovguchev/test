#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

git pull --rebase

sudo nix --extra-experimental-features nix-command profile wipe-history --profile /nix/var/nix/profiles/system --older-than 7d || true
sudo nix-collect-garbage -d
sudo nix --extra-experimental-features nix-command store gc
sudo nix --extra-experimental-features nix-command store optimise

nix --extra-experimental-features nix-command profile wipe-history --profile /nix/var/nix/profiles/per-user/$USER/profile --older-than 7d || true
nix-collect-garbage -d

rm -rf "$HOME/.cache"/* "$HOME/.local/state/nix/profiles"/*-link "$HOME/.nv/ComputeCache"/* "$HOME/.cache/thumbnails"/*

sudo rm -rf /tmp/* /var/tmp/*

echo "Cleanup complete!"
