{ config, pkgs, inputs, ... }:
{
  fonts.fontconfig.enable = false;
  imports = [
    inputs.spicetify-nix.homeManagerModules.default
    ./ags/ags.nix
    ./firefox/firefox.nix
    ./kitty/kitty.nix
    ./hyperland/hyprland.nix
    ./ranger/ranger.nix
    ./spicetify.nix
    ./zsh/zsh.nix
  ];
}
