#!/usr/bin/env bash
set -e
f="$1"
[ -n "$f" ] && [ -f "$f" ] || exit 0
# GIRepository 2.0: prepend_search_path — метод экземпляра. Вызов через dup_default().
# Любой префикс (GIR/GIRepository), одинарные/двойные кавычки, опционально ; и пробелы.
sed -i -E "s|([A-Za-z_][A-Za-z0-9_]*)\\.Repository\\.prepend_search_path\\((['\"])([^'\"]*)\\2\\)\\s*;?|(function(){const _r=\\1.Repository.dup_default();_r.prepend_search_path(\\2\\3\\2);|g" "$f"
sed -i -E "s|([A-Za-z_][A-Za-z0-9_]*)\\.Repository\\.prepend_library_path\\((['\"])([^'\"]*)\\2\\)\\s*;?|_r.prepend_library_path(\\2\\3\\2);})();|g" "$f"
