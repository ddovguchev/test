#!/usr/bin/env bash
set -e
# В Nix build пропускаем блок tsc (NIX_BUILD_TOP задаётся только в Nix)
sed -i '2i [ -n "${NIX_BUILD_TOP:-}" ] \&\& _skip_tsc=1' post_install.sh
sed -i 's|if \[\[ "\$5" == "false" \]\]; then|if [[ "\$5" == "false" ]] \|\| [[ -n "\${_skip_tsc:-}" ]]; then|' post_install.sh
