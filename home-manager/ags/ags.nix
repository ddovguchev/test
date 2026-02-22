{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
  palette = import ../theme/palette.nix;
  layout = import ../theme/layout.nix;
  styleScss = pkgs.writeText "ags-style.scss" ''
    $bar-fg: ${palette.ags.barFg};
    $bar-bg: ${palette.ags.barBg};
    $bar-bg-opacity: ${palette.ags.barBgOpacity};
    $bar-border: ${palette.ags.barBorder};
    $bar-shadow: ${palette.ags.barShadow};
    $navbar-gap: ${toString layout.navbarGap}px;
    $bar-height: ${toString layout.barHeight}px;
    $bar-rounding: ${toString layout.barRounding}px;
    $navbar-height: ${toString (layout.navbarGap + layout.barHeight)}px;

    window.Bar {
      background: $bar-bg;
      color: $bar-fg;
      min-height: $bar-height;
      margin: $navbar-gap;
      margin-bottom: 0;
      font-weight: bold;
      border-radius: $bar-rounding;
      -gtk-icon-shadow: none;
      border-bottom: 1px solid $bar-border;
      box-shadow: 0 1px 3px $bar-shadow;
    }

    /* Workspace indicator: active state - very visible */
    window.Bar button.workspace-active,
    window.Bar .workspace-active {
      background: rgba(224, 226, 232, 0.4) !important;
      border-radius: 6px;
      border: 2px solid rgba(224, 226, 232, 0.8) !important;
      font-weight: bold;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2) !important;
    }

    /* Bar buttons */
    window.Bar .bar-btn {
      padding: 6px 10px;
      min-height: 24px;
    }

    /* NixOS icon - small */
    .nixos-btn image {
      min-width: 14px;
      min-height: 14px;
    }

    /* Separator between clock and nixos */
    .bar-separator {
      opacity: 0.5;
    }

    /* Menu overlay */
    window.MenuOverlay {
      margin-top: $navbar-gap;
      margin-left: $navbar-gap;
      margin-right: $navbar-gap;
      margin-bottom: 0;
    }

    .menu-overlay-block {
      background: $bar-bg;
      color: $bar-fg;
      border: 1px solid $bar-border;
      border-top: none;
      border-radius: 0 0 $bar-rounding $bar-rounding;
      box-shadow: 0 8px 24px $bar-shadow;
      min-width: 900px;
      min-height: 600px;
      margin-top: $navbar-height;
      padding: 12px;
    }
  '';
  system = pkgs.stdenv.hostPlatform.system;
  astalPkgs = inputs.astal.packages.${system};
  agsPkg = inputs.ags.packages.${system}.default;
  astalJs = agsPkg.jsPackage or (throw "ags package has no jsPackage");
  agsBin = "${config.programs.ags.finalPackage}/bin/ags";
  agsConfig = pkgs.runCommand "ags-config" {
    nativeBuildInputs = [ pkgs.coreutils ];
    agsBin = agsBin;
  } ''
    mkdir -p $out/src/widget $out/src/assets $out/node_modules
    cp ${cfg}/src/app.ts ${cfg}/src/env.d.ts ${cfg}/src/tsconfig.json $out/src/
    cp ${styleScss} $out/src/style.scss
    cp -r ${cfg}/src/widget/. $out/src/widget/
    cp -r ${cfg}/src/assets/. $out/src/assets/ 2>/dev/null || true
    echo 'globalThis.AGS_BIN = "'"$agsBin"'";' > $out/src/ags-env.js
    echo "import './src/ags-env.js'; import './src/app'" > $out/app.ts
    ln -s ${astalJs} $out/node_modules/astal
    echo '{"name":"ags-config","type":"module"}' > $out/package.json
  '';
in
{
  programs.ags = {
    enable = true;
    configDir = agsConfig;
    systemd.enable = true;
    extraPackages = with pkgs; [
      astalPkgs.wireplumber
      astalPkgs.notifd
      nixos-icons
    ];
  };

  systemd.user.services.ags.Service.ExecStart = lib.mkForce
    "${config.programs.ags.finalPackage}/bin/ags run app.ts --gtk 4";
  systemd.user.services.ags.Service.WorkingDirectory = config.programs.ags.configDir;
}
