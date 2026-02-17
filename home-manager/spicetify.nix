{ lib, pkgs, ... }:
{
  home.activation.installSpicetifyMarketplace = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
    if ! command -v spicetify >/dev/null 2>&1; then
      echo "spicetify not found, skipping marketplace install"
      exit 0
    fi

    if [ -f "$HOME/.config/spicetify/CustomApps/marketplace/manifest.json" ]; then
      echo "Spicetify Marketplace already installed"
      exit 0
    fi

    echo "Installing Spicetify Marketplace..."
    if ! ${pkgs.curl}/bin/curl -fsSL "https://raw.githubusercontent.com/spicetify/marketplace/main/resources/install.sh" | ${pkgs.bash}/bin/bash; then
      echo "Spicetify Marketplace install failed (non-fatal)"
      exit 0
    fi

    # Apply changes if Spotify/Spicetify setup is present.
    spicetify apply || true
  '';
}
