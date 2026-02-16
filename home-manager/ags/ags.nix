# AGS — официальный home-manager модуль (docs: https://aylur.github.io/ags/guide/nix.html)
{ config, pkgs, inputs, ... }:
let
  # Обёртка: «ags run» → «ags run --gtk 3» (конфиг на astal/gtk3)
  agsBin = "${config.programs.ags.finalPackage}/bin/ags";
  agsWrapper = pkgs.writeShellScript "ags" ''
    if [ "''${1:-}" = "run" ]; then
      shift
      exec "${agsBin}" run --gtk 3 "$@"
    else
      exec "${agsBin}" "$@"
    fi
  '';
  agsRun = pkgs.writeShellScript "ags-run" ''
    cd "''${AGS_CONFIG:-${config.home.homeDirectory}/.config/ags}" && exec "${agsBin}" run --gtk 3 "$@"
  '';
in
{
  imports = [ inputs.ags.homeManagerModules.default ];

  programs.ags = {
    enable = true;
    configDir = ./config;
    extraPackages = with pkgs; [
      inputs.astal.packages.${pkgs.system}.notifd
      inputs.astal.packages.${pkgs.system}.wireplumber
    ];
  };

  home.sessionPath = [ "${config.home.homeDirectory}/.local/bin" ];
  home.file.".local/bin/ags" = {
    source = agsWrapper;
    executable = true;
  };
  home.file.".local/bin/ags-run" = {
    source = agsRun;
    executable = true;
  };
}
