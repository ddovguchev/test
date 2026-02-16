{ config, pkgs, lib, ... }:
{
  # Deploy full AGS/Astal config from repo example/ to ~/.config/ags
  xdg.configFile."ags".source = ./config;

  # Typelibs для ags run: gjs ищет AstalWp и др. по GI_TYPELIB_PATH
  home.sessionVariables.GI_TYPELIB_PATH = lib.makeSearchPath "lib/girepository-1.0" [
    pkgs.astal.wireplumber
    pkgs.astal.astal3
    pkgs.astal.io
  ];
}
