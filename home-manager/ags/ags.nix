{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
  system = pkgs.stdenv.hostPlatform.system;
  agsPkg = inputs.ags.packages.${system}.default;
  astalGjs = agsPkg.jsPackage;
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
  agsConfig = pkgs.runCommand "ags-config" {} ''
    mkdir -p $out/widget $out/node_modules $out/assets
    cp ${cfg}/app.ts $out/app.ts
    cp ${cfg}/tsconfig.json $out/tsconfig.json
    cp ${cfg}/env.d.ts $out/env.d.ts
    cp ${cfg}/.gitignore $out/.gitignore
    cp -r ${cfg}/assets/. $out/assets/
    cp ${cfg}/widget/Bar.tsx $out/widget/Bar.tsx
    cp ${cfg}/widget/Launcher.tsx $out/widget/Launcher.tsx
    cp ${cfg}/widget/launcherState.ts $out/widget/launcherState.ts

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
    makeWrapper ${agsPkg}/bin/ags $out/bin/ags \
      --set GI_TYPELIB_PATH "${typelib}" \
      --set GSETTINGS_SCHEMA_DIR "${schema}" \
      --prefix XDG_DATA_DIRS : "${gsettingsData}:${data}"
  '';
  bin = "${wrapped}/bin/ags";
  agsSh = pkgs.writeShellScript "ags" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${gsettingsData}:${data}:''${XDG_DATA_DIRS:-}"
    if [ "''${1:-}" = "run" ]; then shift; exec "${bin}" run --gtk 3 "$@"; else exec "${bin}" "$@"; fi
  '';
  agsRunSh = pkgs.writeShellScript "ags-run" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${gsettingsData}:${data}:''${XDG_DATA_DIRS:-}"
    cd "''${AGS_CONFIG:-$HOME/.config/ags}" && exec "${bin}" run --gtk 3 "$@"
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
      After = [ "graphical-session.target" "hyprland-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      Type = "simple";
      ExecStart = "${config.home.profileDirectory}/bin/ags-run";
      Restart = "on-failure";
      RestartSec = 3;
      Environment = "PATH=${config.home.profileDirectory}/bin:/run/current-system/sw/bin";
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
