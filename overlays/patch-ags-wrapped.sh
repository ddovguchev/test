#!/usr/bin/env bash
set -e
f="$1"
lib="$2"
[ -n "$f" ] && [ -n "$lib" ] || exit 1
[ -f "$f" ] || exit 0
substituteInPlace "$f" \
  --replace "GIR.Repository.prepend_search_path('$lib');" \
  "(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path('$lib');"
substituteInPlace "$f" \
  --replace "GIR.Repository.prepend_library_path('$lib');" \
  "_r.prepend_library_path('$lib');})();"
