{ config, pkgs, ... }:
{
  imports = [
    ./ags/ags.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./zsh/zsh.nix
  ];
}
