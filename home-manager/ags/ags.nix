{ config, pkgs, lib, flakeRoot ? null, ... }:
let
  # Use flake root path when available - ensures config is from the actual project
  cfg = if flakeRoot != null
    then (flakeRoot + "/home-manager/ags/config")
    else ./config;
  astalDeps = [
    pkgs.astal.astal3
    pkgs.astal.io
    pkgs.astal.wireplumber
    pkgs.astal.notifd
  ];
  typelib = lib.makeSearchPath "lib/girepository-1.0" astalDeps;
  schema = lib.makeSearchPath "share/glib-2.0/schemas" astalDeps;
  gsettingsData = lib.concatStringsSep ":" (map (p: "${p}/share/gsettings-schemas/${p.name}") astalDeps);
  systemDataDirs = lib.concatStringsSep ":" [
    "/run/current-system/sw/share"
    "/etc/profiles/per-user/${config.home.username}/share"
    "${config.home.profileDirectory}/share"
    "${config.home.homeDirectory}/.nix-profile/share"
    "/usr/local/share"
    "/usr/share"
  ];
  data = lib.concatStringsSep ":" [
    (lib.makeSearchPath "share" (astalDeps ++ [
      pkgs.hicolor-icon-theme
      pkgs.adwaita-icon-theme
      pkgs.gnome-icon-theme
    ]))
    systemDataDirs
  ];
  astalGjs = "${pkgs.astal.gjs}/share/astal/gjs";
  palette = import ../theme/palette.nix;
  styleScss = builtins.replaceStrings
    [
      "__FG_COLOR__"
      "__BAR_BG__"
      "__BAR_BORDER__"
      "__BAR_SHADOW__"
      "__PANEL_BG__"
      "__PANEL_TEXT__"
      "__PANEL_BORDER__"
    ]
    [
      palette.ags.barFg
      palette.ags.barBgOpacity
      palette.ags.barBorder
      palette.ags.barShadow
      palette.ags.panelBg
      palette.ags.launcherText
      palette.ags.panelBorder
    ]
    (builtins.readFile "${cfg}/style.scss");
  agsConfig = pkgs.runCommand "ags-config" {
    src = cfg;
    # Ensures config changes trigger rebuild
  } ''
        mkdir -p $out/widget $out/node_modules $out/assets
        cp $src/app.ts $out/app.ts
        cp $src/tsconfig.json $out/tsconfig.json
        cp $src/env.d.ts $out/env.d.ts
        cp $src/.gitignore $out/.gitignore 2>/dev/null || true
        cp -r $src/assets/. $out/assets/
        cp $src/widget/Bar.tsx $out/widget/Bar.tsx
        cp $src/widget/Launcher.tsx $out/widget/Launcher.tsx
        cp $src/widget/launcherState.ts $out/widget/launcherState.ts

        cat > $out/style.scss <<'EOF'
    ${styleScss}
    EOF

        cat > $out/package.json <<'EOF'
    {
      "name": "astal-shell",
      "dependencies": {
        "astal": "${astalGjs}"
      }
    }
    EOF

        ln -s ${astalGjs} $out/node_modules/astal
  '';
  wrapped = pkgs.runCommand "ags-wrapped" { buildInputs = [ pkgs.makeWrapper ]; } ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.ags}/bin/ags $out/bin/ags \
      --set GI_TYPELIB_PATH "${typelib}" \
      --set GSETTINGS_SCHEMA_DIR "${schema}" \
      --prefix XDG_DATA_DIRS : "${gsettingsData}:${data}"
  '';
  bin = "${wrapped}/bin/ags";
  agsSh = pkgs.writeShellScript "ags" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${gsettingsData}:${data}:''${XDG_DATA_DIRS:-}"
    if [ "''${1:-}" = "run" ]; then shift; exec "${bin}" run "$@"; else exec "${bin}" "$@"; fi
  '';
  agsRunSh = pkgs.writeShellScript "ags-run" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${gsettingsData}:${data}:''${XDG_DATA_DIRS:-}"
    cd "''${AGS_CONFIG:-$HOME/.config/ags}" && exec "${bin}" run "$@"
  '';
  agsSyncSh = pkgs.writeShellScript "ags-sync-config" ''
    CONFIG_SRC="''${HOME}/nixos-flake/home-manager/ags/config"
    if [ ! -d "$CONFIG_SRC" ]; then
      CONFIG_SRC="${cfg}"
    fi
    CONFIG_DST="''${HOME}/.config/ags"
    rm -rf "$CONFIG_DST"
    mkdir -p "$CONFIG_DST"/{widget,assets,node_modules}

    sed -e "s|__FG_COLOR__|${palette.ags.barFg}|g" \
        -e "s|__BAR_BG__|${palette.ags.barBgOpacity}|g" \
        -e "s|__BAR_BORDER__|${palette.ags.barBorder}|g" \
        -e "s|__BAR_SHADOW__|${palette.ags.barShadow}|g" \
        -e "s|__PANEL_BG__|${palette.ags.panelBg}|g" \
        -e "s|__PANEL_TEXT__|${palette.ags.launcherText}|g" \
        -e "s|__PANEL_BORDER__|${palette.ags.panelBorder}|g" \
        "$CONFIG_SRC/style.scss" > "$CONFIG_DST/style.scss"

    cp "$CONFIG_SRC/app.ts" "$CONFIG_DST/"
    cp "$CONFIG_SRC/widget/Bar.tsx" "$CONFIG_DST/widget/"
    cp "$CONFIG_SRC/widget/Launcher.tsx" "$CONFIG_DST/widget/"
    cp "$CONFIG_SRC/widget/launcherState.ts" "$CONFIG_DST/widget/"
    cp -r "$CONFIG_SRC/assets/." "$CONFIG_DST/assets/"
    cp "$CONFIG_SRC/tsconfig.json" "$CONFIG_DST/" 2>/dev/null || true
    cp "$CONFIG_SRC/env.d.ts" "$CONFIG_DST/" 2>/dev/null || true
    ln -sfn ${astalGjs} "$CONFIG_DST/node_modules/astal"
    echo '{"name":"ags","dependencies":{"astal":"${astalGjs}"}}' > "$CONFIG_DST/package.json"
  '';
  agsRebuildSh = pkgs.writeShellScript "ags-rebuild" ''
    echo "Syncing AGS config and restarting..."
    ${agsSyncSh}
    systemctl --user restart ags.service
    echo "Done."
  '';
  agsScripts = pkgs.runCommand "ags-scripts" { } ''
    mkdir -p $out/bin
    cp ${agsSh} $out/bin/ags
    cp ${agsRunSh} $out/bin/ags-run
    cp ${agsRebuildSh} $out/bin/ags-rebuild
    chmod +x $out/bin/ags $out/bin/ags-run $out/bin/ags-rebuild
  '';
in
{
  home.packages = [ agsScripts ];
  systemd.user.services.ags = {
    Unit = {
      Description = "Astal/AGS shell";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      Type = "simple";
      ExecStartPre = "${agsSyncSh}";
      ExecStart = "${config.home.profileDirectory}/bin/ags-run";
      Restart = "on-failure";
      RestartSec = 2;
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
  };
  home.sessionVariables = {
    GI_TYPELIB_PATH = typelib;
    GSETTINGS_SCHEMA_DIR = schema;
    XDG_DATA_DIRS = "${gsettingsData}:${data}";
  };
}
