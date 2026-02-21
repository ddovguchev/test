{ config, pkgs, lib, ... }:
let
  cfg = ./config;
  palette = import ../../theme/palette.nix;
  styleScss = pkgs.writeText "ags-style.scss" ''
    $bar-fg: ${palette.ags.barFg};
    $bar-bg: ${palette.ags.barBg};
    $bar-bg-opacity: ${palette.ags.barBgOpacity};
    $bar-border: ${palette.ags.barBorder};
    $bar-shadow: ${palette.ags.barShadow};

    window.Bar {
      background: $bar-bg-opacity;
      color: $bar-fg;
      min-height: 32px;
      font-weight: bold;
      border-bottom: 1px solid $bar-border;
      box-shadow: 0 2px 8px $bar-shadow;

      >.bar-row {
        min-width: 100%;
        display: flex;
      }

      .bar-left,
      .bar-center,
      .bar-right {
        display: flex;
        align-items: center;
      }

      .bar-left { justify-content: flex-start; }
      .bar-center { justify-content: center; }
      .bar-right { justify-content: flex-end; }
    }
  '';
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
  agsConfig = pkgs.runCommand "ags-config" {
    nativeBuildInputs = [ pkgs.ags ];
    GI_TYPELIB_PATH = typelib;
    GSETTINGS_SCHEMA_DIR = schema;
    XDG_DATA_DIRS = "${gsettingsData}:${data}";
  } ''
    buildDir=$TMPDIR/ags-build
    mkdir -p $buildDir/node_modules $buildDir/src/widget $buildDir/src/assets
    cp ${cfg}/src/app.ts ${cfg}/src/env.d.ts ${styleScss} $buildDir/src/style.scss
    cp ${cfg}/src/tsconfig.json $buildDir/src/
    cp ${cfg}/src/widget/Bar.tsx $buildDir/src/widget/
    cp -r ${cfg}/src/assets/. $buildDir/src/assets/ 2>/dev/null || true
    echo '{"name":"astal-shell","dependencies":{"astal":"${astalGjs}"}}' > $buildDir/package.json
    ln -s ${astalGjs} $buildDir/node_modules/astal
    cd $buildDir && ags bundle src/app.ts dist/bundle.js -r .
    mkdir -p $out
    cp -r $buildDir/dist $out/
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
    config="''${AGS_CONFIG:-$HOME/.config/ags}"
    if [ -f "$config/dist/bundle.js" ]; then
      exec "${bin}" run "$config/dist/bundle.js" "$@"
    else
      cd "$config" && exec "${bin}" run "$@"
    fi
  '';
  agsScripts = pkgs.runCommand "ags-scripts" { } ''
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
