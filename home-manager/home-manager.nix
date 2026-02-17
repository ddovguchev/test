{ config, pkgs, ... }:
{
  fonts.fontconfig.enable = false;
  imports = [
    ./ags/ags.nix
    ./wallpapers.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./zsh/zsh.nix
  ];
}
