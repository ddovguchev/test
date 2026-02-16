#!/usr/bin/env bash
set -e
f="$1"
[ -n "$f" ] && [ -f "$f" ] || exit 0
# GIRepository 2.0: prepend_search_path — метод экземпляра, не класса. Берём репозиторий через dup_default().
# Одинарные кавычки:
sed -i "s|GIR\.Repository\.prepend_search_path('\([^']*\)');|(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path('\1');|" "$f"
sed -i "s|GIR\.Repository\.prepend_library_path('\([^']*\)');|_r.prepend_library_path('\1');})();|" "$f"
# Двойные кавычки (на случай другого формата в обёртке):
sed -i 's|GIR\.Repository\.prepend_search_path("\([^"]*\)");|(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path("\1");|' "$f"
sed -i 's|GIR\.Repository\.prepend_library_path("\([^"]*\)");|_r.prepend_library_path("\1");})();|' "$f"
