{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
  palette = import ../theme/palette.nix;
  layout = import ../theme/layout.nix;
  styleScss = pkgs.writeText "ags-style.scss" ''
    window.Bar {
      background: ${palette.ags.barBgOpacity};
      color: ${palette.ags.barFg};
      min-height: ${toString layout.barHeight}px;
      margin: ${toString layout.navbarGap}px;
      margin-bottom: 0;
      font-weight: bold;
      border-radius: ${toString layout.barRounding}px;
      -gtk-icon-shadow: none;
      border-bottom: 1px solid ${palette.ags.barBorder};
      box-shadow: 0 1px 3px ${palette.ags.barShadow};
    }

    window.Bar .bar {
      padding: 0 8px;
      spacing: 4px;
    }

    /* Bar buttons: flat, no background */
    window.Bar .bar-btn,
    window.Bar menubutton.bar-btn {
      background: transparent;
      border: none;
      box-shadow: none;
    }

    .workspace-active {
      background: rgba(224, 226, 232, 0.2);
      border-radius: 6px;
    }

    .apps-logo-btn image,
    .apps-logo-btn picture {
      min-width: 20px;
      min-height: 20px;
    }

    popover.apps-menu,
    popover.notifications-menu,
    popover.power-menu {
      margin-top: -1px;
    }

    /* Popover: dark background like navbar - literal values for GTK */
    popover.apps-menu contents,
    popover.notifications-menu contents,
    popover.power-menu contents,
    popover.background contents {
      background-color: ${palette.ags.barBgOpacity};
      color: ${palette.ags.barFg};
      font-weight: bold;
      border: 1px solid ${palette.ags.barBorder};
      border-top: none;
      border-radius: 0 0 ${toString layout.barRounding}px ${toString layout.barRounding}px;
      box-shadow: 0 1px 3px ${palette.ags.barShadow};
      -gtk-icon-shadow: none;
      padding: 8px;
      min-width: 500px;
      min-height: 500px;
    }
  '';
  system = pkgs.stdenv.hostPlatform.system;
  astalPkgs = inputs.astal.packages.${system};
  agsPkg = inputs.ags.packages.${system}.default;
  astalJs = agsPkg.jsPackage or (throw "ags package has no jsPackage");
  nixosIcons = pkgs.nixos-icons;
  agsConfig = pkgs.runCommand "ags-config" {
    nativeBuildInputs = [ pkgs.coreutils ];
  } ''
    mkdir -p $out/src/widget $out/src/assets $out/node_modules
    cp ${cfg}/src/app.ts ${cfg}/src/env.d.ts ${cfg}/src/tsconfig.json $out/src/
    cp ${styleScss} $out/src/style.scss
    cp -r ${cfg}/src/widget/. $out/src/widget/
    cp -r ${cfg}/src/assets/. $out/src/assets/ 2>/dev/null || true
    mkdir -p $out/src/assets/icons
    icon=$(find ${nixosIcons} -name "nix-snowflake.svg" 2>/dev/null | head -1)
    [ -n "$icon" ] && cp "$icon" $out/src/assets/icons/ || true
    echo "import './src/app'" > $out/app.ts
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
