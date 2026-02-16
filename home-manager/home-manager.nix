{ config, pkgs, inputs, ... }:
{
  imports = [
    ./ags/ags.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./zsh/zsh.nix
  ];
}
