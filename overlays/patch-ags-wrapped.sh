#!/usr/bin/env bash
set -e
f="$1"
[ -n "$f" ] && [ -f "$f" ] || exit 0
# Любой путь в кавычках — через sed, без substituteInPlace
sed -i "s|GIR\.Repository\.prepend_search_path('\([^']*\)');|(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path('\1');|" "$f"
sed -i "s|GIR\.Repository\.prepend_library_path('\([^']*\)');|_r.prepend_library_path('\1');})();|" "$f"
