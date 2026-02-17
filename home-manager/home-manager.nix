{ config, pkgs, ... }:
{
  fonts.fontconfig.enable = false;
  imports = [
    ./ags/ags.nix
    ./firefox/firefox.nix
    ./ags/wallpapers.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./spicetify.nix
    ./zsh/zsh.nix
  ];
}
