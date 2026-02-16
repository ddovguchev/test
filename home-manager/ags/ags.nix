{ config, pkgs, lib, ... }:
let
  agsTypelibPath = lib.makeSearchPath "lib/girepository-1.0" [
    pkgs.astal.wireplumber
    pkgs.astal.astal3
    pkgs.astal.io
  ];
in
{
  # Deploy full AGS/Astal config from repo example/ to ~/.config/ags
  xdg.configFile."ags".source = ./config;

  # Wrapper: выставляет GI_TYPELIB_PATH и запускает ags run из ~/.config/ags
  # (sessionVariables из profile не всегда подхватываются при старте Hyprland)
  home.file.".local/bin/ags-run" = {
    executable = true;
    text = ''
    #!/bin/sh
    export GI_TYPELIB_PATH="${agsTypelibPath}"
    cd "''${XDG_CONFIG_HOME:-$HOME/.config}/ags" && exec ags run "$@"
  '';
  };

  home.sessionVariables.GI_TYPELIB_PATH = agsTypelibPath;
}
