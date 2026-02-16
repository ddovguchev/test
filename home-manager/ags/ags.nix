{ config, pkgs, ... }:
{
  # Deploy full AGS/Astal config from repo example/ to ~/.config/ags
  xdg.configFile."ags".source = ./config;
}
