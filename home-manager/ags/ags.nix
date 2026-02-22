{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
  palette = import ../theme/palette.nix;
  layout = import ../theme/layout.nix;
  barBg = lib.replaceStrings ["\n" "\r"] ["" ""] (builtins.toString palette.ags.barBg);
  barFg = lib.replaceStrings ["\n" "\r"] ["" ""] (builtins.toString palette.ags.barFg);
  barBorder = lib.replaceStrings ["\n" "\r"] ["" ""] (builtins.toString palette.ags.barBorder);
  barShadow = lib.replaceStrings ["\n" "\r"] ["" ""] (builtins.toString palette.ags.barShadow);
  styleScss = pkgs.writeText "ags-style.scss" ''
    window.Bar {
      background: ${barBg};
      color: ${barFg};
      min-height: ${toString layout.barHeight}px;
      margin: ${toString layout.navbarGap}px;
      margin-bottom: 0;
      font-weight: bold;
      border-radius: ${toString layout.barRounding}px;
      -gtk-icon-shadow: none;
      border-bottom: 1px solid ${barBorder};
      box-shadow: 0 1px 3px ${barShadow};
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
      margin-top: ${toString layout.navbarGap}px;
      margin-left: ${toString layout.navbarGap}px;
      margin-right: ${toString layout.navbarGap}px;
      margin-bottom: 0;
    }

    .menu-overlay-block {
      background: ${barBg};
      color: ${barFg};
      border: 1px solid ${barBorder};
      border-top: none;
      border-radius: 0 0 ${toString layout.barRounding}px ${toString layout.barRounding}px;
      box-shadow: 0 8px 24px ${barShadow};
      min-width: 900px;
      min-height: 600px;
      margin-top: ${toString (layout.navbarGap + layout.barHeight)}px;
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
