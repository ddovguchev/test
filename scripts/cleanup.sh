#!/usr/bin/env bash
set -e

# Переход в git-корень (предполагается, что скрипт рядом с flake)
cd "$(dirname "$0")/.."

# Обновить flake из git
git pull --rebase

# Очистка устаревших nix путей и оптимизация хранилища
sudo nix profile wipe-history --profile /nix/var/nix/profiles/system --older-than 7d || true
sudo nix-collect-garbage -d
sudo nix store gc
sudo nix store optimise

# Очистка пользовательского nix профиля (история и мусор)
nix profile wipe-history --profile /nix/var/nix/profiles/per-user/$USER/profile --older-than 7d || true
nix-collect-garbage -d

# Очистка основных пользовательских кешей и временных файлов
rm -rf "$HOME/.cache"/* "$HOME/.local/state/nix/profiles"/*-link "$HOME/.nv/ComputeCache"/* "$HOME/.cache/thumbnails"/*

# Очистка системных временных директорий
sudo rm -rf /tmp/* /var/tmp/*

echo "Cleanup complete!"
