#!/usr/bin/env bash
set -e
f="$1"
[ -n "$f" ] && [ -f "$f" ] || exit 0
# GIRepository 2.0: prepend_search_path — метод экземпляра, не класса. Вызов через dup_default().
# Поддержка и GIR.Repository и GIRepository.Repository (gjs может использовать любой).
for prefix in GIR GIRepository; do
  sed -i "s|${prefix}\.Repository\.prepend_search_path('\([^']*\)');|(function(){const _r=${prefix}.Repository.dup_default();_r.prepend_search_path('\1');|g" "$f"
  sed -i "s|${prefix}\.Repository\.prepend_library_path('\([^']*\)');|_r.prepend_library_path('\1');})();|g" "$f"
  sed -i "s|${prefix}\.Repository\.prepend_search_path(\"\([^\"]*\)\");|(function(){const _r=${prefix}.Repository.dup_default();_r.prepend_search_path(\"\1\");|g" "$f"
  sed -i "s|${prefix}\.Repository\.prepend_library_path(\"\([^\"]*\)\");|_r.prepend_library_path(\"\1\");})();|g" "$f"
done
