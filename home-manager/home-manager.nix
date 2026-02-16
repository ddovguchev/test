{ config, pkgs, ... }:
{
  imports = [
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./ags/ags.nix
    ./zsh/zsh.nix
  ];
}