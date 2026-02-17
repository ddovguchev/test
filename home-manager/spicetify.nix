{ pkgs, inputs, ... }:
let
  spicePkgs = inputs.spicetify-nix.legacyPackages.${pkgs.stdenv.hostPlatform.system};
in
{
  programs.spicetify = {
    enable = true;
    enabledCustomApps = with spicePkgs.apps; [ marketplace ];
  };

  home.activation.setSpicetifyMarketplaceTheme = inputs.home-manager.lib.hm.dag.entryAfter [ "writeBoundary" ] ''
    cfg="$HOME/.config/spicetify/config-xpui.ini"
    mkdir -p "$HOME/.config/spicetify"

    if [ ! -f "$cfg" ]; then
      cat > "$cfg" <<'EOF'
[Setting]
current_theme = marketplace
EOF
      exit 0
    fi

    if grep -q '^\[Setting\]' "$cfg"; then
      if grep -q '^current_theme[[:space:]]*=' "$cfg"; then
        sed -i 's/^current_theme[[:space:]]*=.*/current_theme = marketplace/' "$cfg"
      else
        awk '
          BEGIN { inserted = 0 }
          /^\[Setting\]/ {
            print $0
            print "current_theme = marketplace"
            inserted = 1
            next
          }
          { print $0 }
          END {
            if (inserted == 0) {
              print ""
              print "[Setting]"
              print "current_theme = marketplace"
            }
          }
        ' "$cfg" > "$cfg.tmp"
        mv "$cfg.tmp" "$cfg"
      fi
    else
      cat >> "$cfg" <<'EOF'

[Setting]
current_theme = marketplace
EOF
    fi
  '';
}
