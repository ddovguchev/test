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

    window.Bar {
      background: $bar-bg-opacity;
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
    window.Bar label.clock {
      min-width: 80px;
    }
  '';
  system = pkgs.stdenv.hostPlatform.system;
  astalPkgs = inputs.astal.packages.${system};
  agsPkg = inputs.ags.packages.${system}.default;
  astalJs = agsPkg.jsPackage or (throw "ags package has no jsPackage");
  agsConfig = pkgs.runCommand "ags-config" {
    nativeBuildInputs = [ pkgs.coreutils ];
  } ''
    mkdir -p $out/src/widget $out/src/assets $out/node_modules
    cp ${cfg}/src/app.ts ${cfg}/src/env.d.ts ${cfg}/src/tsconfig.json $out/src/
    cp ${styleScss} $out/src/style.scss
    cp -r ${cfg}/src/widget/. $out/src/widget/
    cp -r ${cfg}/src/assets/. $out/src/assets/ 2>/dev/null || true
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
    ];
  };

  # Entry point must be given; run from configDir so ags finds app.ts.
  systemd.user.services.ags.Service.ExecStart = lib.mkForce
    "${config.programs.ags.finalPackage}/bin/ags run app.ts --gtk 4";
  systemd.user.services.ags.Service.WorkingDirectory = config.programs.ags.configDir;
}
