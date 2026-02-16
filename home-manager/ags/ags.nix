# AGS — официальный home-manager модуль (docs: https://aylur.github.io/ags/guide/nix.html)
{ config, pkgs, inputs, ... }:
let
  # Конфиг на gtk3 (app.ts импортирует astal/gtk3) — без --gtk 3 ags не выводит версию
  agsRun = pkgs.writeShellScript "ags-run" ''
    cd "''${AGS_CONFIG:-${config.home.homeDirectory}/.config/ags}" && exec ags run --gtk 3 "$@"
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
  home.file.".local/bin/ags-run" = {
    source = agsRun;
    executable = true;
  };
}
