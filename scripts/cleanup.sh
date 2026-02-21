#!/usr/bin/env bash
set -e

# Переходим в корень flake
cd "$(dirname "$0")/.."

# Обновляем конфигурацию из Git
git pull --rebase

# Очищаем старые поколения и оптимизируем nix-хранилище
sudo nix --extra-experimental-features nix-command profile wipe-history --profile /nix/var/nix/profiles/system --older-than 7d || true
sudo nix-collect-garbage -d
sudo nix --extra-experimental-features nix-command store gc
sudo nix --extra-experimental-features nix-command store optimise

# Очищаем nix-профиль пользователя
nix --extra-experimental-features nix-command profile wipe-history --profile /nix/var/nix/profiles/per-user/$USER/profile --older-than 7d || true
nix-collect-garbage -d

# Удаляем кеши и временные файлы пользователя
rm -rf "$HOME/.cache"/* "$HOME/.local/state/nix/profiles"/*-link "$HOME/.nv/ComputeCache"/* "$HOME/.cache/thumbnails"/*

# Удаляем системные временные файлы
sudo rm -rf /tmp/* /var/tmp/*

echo "Cleanup complete!"
