# AGS (Astal): конфиг из examples/ags + обёртки для typelibs.
{ config, pkgs, lib, ... }:
let
  # Конфиг AGS в этой папке
  agsConfigDir = ./config;
  astalPkgs = with pkgs; [
    astal.astal3
    astal.io
    astal.wireplumber
    astal.notifd
  ];
  typelibPath = lib.makeSearchPath "lib/girepository-1.0" astalPkgs;
  agsRun = pkgs.writeShellScript "ags-run" ''
    export GI_TYPELIB_PATH="${typelibPath}"
    cd "''${AGS_CONFIG:-$HOME/.config/ags}" && exec ${pkgs.ags}/bin/ags run "$@"
  '';
  # Обёртка ags: "ags run" идёт через ags-run (с typelibs), остальное — в настоящий ags.
  agsWrapper = pkgs.writeShellScript "ags-wrapper" ''
    case "''${1:-}" in
      run) exec "${agsRun}" "''${@:2}" ;;
      *)   exec ${pkgs.ags}/bin/ags "$@" ;;
    esac
  '';
in
{
  # Развернуть конфиг AGS в ~/.config/ags
  xdg.configFile."ags".source = agsConfigDir;

  home.sessionPath = [ "$HOME/.local/bin" ];

  home.file.".local/bin/ags-run" = {
    source = agsRun;
    executable = true;
  };

  home.file.".local/bin/ags" = {
    source = agsWrapper;
    executable = true;
  };

  # Чтобы ags init и типы работали: GIR для ts-for-gir (если понадобится)
  home.sessionVariables = {
    GI_TYPELIB_PATH = typelibPath;
  };
}
