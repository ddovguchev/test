{ config, pkgs, ... }:
{
  fonts.fontconfig.enable = false;
  imports = [
    ./ags/ags.nix
    ./firefox.nix
    ./ags/wallpapers.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./zsh/zsh.nix
  ];
}
