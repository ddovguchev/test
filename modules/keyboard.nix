{ config, pkgs, lib, ... }:
{
  # Console keyboard layout (for TTY)
  console.keyMap = lib.mkDefault "us";
  
  # Note: Keyboard layout for Wayland/Hyprland is configured in home-manager
  # See: home-manager/hyperland/hyprland.nix
  # Wayland compositors handle keyboard configuration directly
}
