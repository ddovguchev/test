#!/usr/bin/env bash
set -e
f="$1"
[ -n "$f" ] && [ -f "$f" ] || exit 0
# GIRepository 2.0: prepend_search_path/prepend_library_path — не функции класса.
# Убираем вызовы: путь уже задаётся через GI_TYPELIB_PATH в обёртке wrapGApps.
sed -i -E "s|([A-Za-z_][A-Za-z0-9_]*)\\.Repository\\.prepend_search_path\\([^)]+\\)\\s*;?|/* Nix: GI_TYPELIB_PATH */;|g" "$f"
sed -i -E "s|([A-Za-z_][A-Za-z0-9_]*)\\.Repository\\.prepend_library_path\\([^)]+\\)\\s*;?|/* Nix */;|g" "$f"
