# AGS — официальный home-manager модуль (docs: https://aylur.github.io/ags/guide/nix.html)
{ config, pkgs, inputs, ... }:
let
  agsConfigDir = ./config;
  # Официальный модуль кладёт astal в ~/.local/share/ags — package.json должен указывать туда
  astalPath = "file:${config.home.homeDirectory}/.local/share/ags";
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
    configDir = null;
    extraPackages = with pkgs; [
      inputs.astal.packages.${pkgs.system}.notifd
      inputs.astal.packages.${pkgs.system}.wireplumber
    ];
  };

  # Конфиг по файлам, чтобы package.json указывал на ~/.local/share/ags (модуль туда ставит astal)
  xdg.configFile."ags/app.ts".source = "${agsConfigDir}/app.ts";
  xdg.configFile."ags/style.scss".source = "${agsConfigDir}/style.scss";
  xdg.configFile."ags/tsconfig.json".source = "${agsConfigDir}/tsconfig.json";
  xdg.configFile."ags/env.d.ts".source = "${agsConfigDir}/env.d.ts";
  xdg.configFile."ags/.gitignore".source = "${agsConfigDir}/.gitignore";
  xdg.configFile."ags/widget/Bar.tsx".source = "${agsConfigDir}/widget/Bar.tsx";
  xdg.configFile."ags/package.json".text = builtins.toJSON {
    name = "astal-shell";
    dependencies = { astal = astalPath; };
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
