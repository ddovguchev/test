{ config, pkgs, lib, ... }:
let
  cfg = ./config;
  astalDeps = [
    pkgs.astal.astal3
    pkgs.astal.io
    pkgs.astal.wireplumber
    pkgs.astal.notifd
  ];
  typelib = lib.makeSearchPath "lib/girepository-1.0" astalDeps;
  schema = lib.makeSearchPath "share/glib-2.0/schemas" astalDeps;
  gsettingsData = lib.concatStringsSep ":" (map (p: "${p}/share/gsettings-schemas/${p.name}") astalDeps);
  data = lib.makeSearchPath "share" astalDeps;
  astalGjs = "${pkgs.astal.gjs}/share/astal/gjs";
  palette = import ../theme/palette.nix;
  agsConfig = pkgs.runCommand "ags-config" {} ''
    mkdir -p $out/widget $out/node_modules
    cp ${cfg}/app.ts $out/app.ts
    cp ${cfg}/tsconfig.json $out/tsconfig.json
    cp ${cfg}/env.d.ts $out/env.d.ts
    cp ${cfg}/.gitignore $out/.gitignore
    cp ${cfg}/widget/Bar.tsx $out/widget/Bar.tsx
    cp ${cfg}/widget/Launcher.tsx $out/widget/Launcher.tsx
    cp ${cfg}/widget/launcherState.ts $out/widget/launcherState.ts

    cat > $out/style.scss <<'EOF'
$fg-color: ${palette.ags.barFg};
$bg-color: ${palette.ags.barBg};
$launcher-overlay: ${palette.ags.launcherOverlay};
$launcher-text: ${palette.ags.launcherText};
$launcher-panel: ${palette.ags.launcherPanel};
$launcher-tile: ${palette.ags.launcherTile};
$launcher-tile-hover: ${palette.ags.launcherTileHover};

EOF
    cat ${cfg}/style.scss >> $out/style.scss

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
  agsScripts = pkgs.runCommand "ags-scripts" {} ''
    mkdir -p $out/bin
    cp ${agsSh} $out/bin/ags
    cp ${agsRunSh} $out/bin/ags-run
    chmod +x $out/bin/ags $out/bin/ags-run
  '';
in
{
  xdg.configFile."ags".source = agsConfig;
  home.packages = [ agsScripts ];
  systemd.user.services.ags = {
    Unit = {
      Description = "Astal/AGS shell";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      Type = "simple";
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
