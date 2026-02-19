#!/usr/bin/env bash
# Sync AGS config from project to ~/.config/ags (bypasses Nix cache)
# Run from project root: ./home-manager/ags/sync-config.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_SRC="${SCRIPT_DIR}/config"
CONFIG_DST="${HOME}/.config/ags"
PALETTE="${SCRIPT_DIR}/../theme/palette.nix"

mkdir -p "$CONFIG_DST"/{widget,assets,node_modules}

# Get palette values from palette.nix
get_palette() {
  grep -A1 "ags = {" "$PALETTE" | tail -1
}
BAR_FG=$(grep 'barFg = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
BAR_BG=$(grep 'barBgOpacity = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
BAR_BORDER=$(grep 'barBorder = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
BAR_SHADOW=$(grep 'barShadow = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
PANEL_BG=$(grep 'panelBg = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
PANEL_TEXT=$(grep 'launcherText = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')
PANEL_BORDER=$(grep 'panelBorder = ' "$PALETTE" | sed 's/.*"\(.*\)".*/\1/')

# Process style.scss
sed -e "s|__FG_COLOR__|${BAR_FG}|g" \
    -e "s|__BAR_BG__|${BAR_BG}|g" \
    -e "s|__BAR_BORDER__|${BAR_BORDER}|g" \
    -e "s|__BAR_SHADOW__|${BAR_SHADOW}|g" \
    -e "s|__PANEL_BG__|${PANEL_BG}|g" \
    -e "s|__PANEL_TEXT__|${PANEL_TEXT}|g" \
    -e "s|__PANEL_BORDER__|${PANEL_BORDER}|g" \
    "$CONFIG_SRC/style.scss" > "$CONFIG_DST/style.scss"

# Copy files
cp "$CONFIG_SRC/app.ts" "$CONFIG_DST/"
cp "$CONFIG_SRC/tsconfig.json" "$CONFIG_DST/" 2>/dev/null || true
cp "$CONFIG_SRC/env.d.ts" "$CONFIG_DST/" 2>/dev/null || true
cp -r "$CONFIG_SRC/assets/." "$CONFIG_DST/assets/"
cp "$CONFIG_SRC/widget/Bar.tsx" "$CONFIG_DST/widget/"
cp "$CONFIG_SRC/widget/Launcher.tsx" "$CONFIG_DST/widget/"
cp "$CONFIG_SRC/widget/launcherState.ts" "$CONFIG_DST/widget/"

# package.json and astal symlink - need from nix
if [ -d "$HOME/.nix-profile/lib/node_modules/astal" ]; then
  ln -sfn "$HOME/.nix-profile/lib/node_modules/astal" "$CONFIG_DST/node_modules/astal" 2>/dev/null || true
fi
# Try common astal paths
for path in /run/current-system/sw/share/astal/gjs \
            /etc/profiles/per-user/$(whoami)/share/astal/gjs \
            "$HOME/.nix-profile/share/astal/gjs"; do
  if [ -d "$path" ]; then
    ln -sfn "$path" "$CONFIG_DST/node_modules/astal" 2>/dev/null || true
    break
  fi
done

# Create minimal package.json if needed
if [ ! -f "$CONFIG_DST/package.json" ]; then
  echo '{"name":"ags","dependencies":{"astal":"link:node_modules/astal"}}' > "$CONFIG_DST/package.json"
fi

echo "Config synced to $CONFIG_DST"
echo "Restarting AGS..."
systemctl --user restart ags.service 2>/dev/null || true
echo "Done."
