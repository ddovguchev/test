{ config, pkgs, lib, ... }:
{
  # Enable Hyprland Wayland compositor (pure Wayland, no X11)
  programs.hyprland = {
    enable = lib.mkDefault true;
    # XWayland for legacy X11 app compatibility (optional)
    # Disable if you don't need X11 apps at all
    xwayland.enable = lib.mkDefault true;
  };
  
  # SDDM display manager (Wayland-only)
  services.displayManager.sddm = {
    enable = lib.mkDefault true;
    wayland.enable = lib.mkDefault true;
    # Optional: Set default session
    # defaultSession = "hyprland";
  };
  
  # XDG portal for Wayland app integration
  xdg.portal = {
    enable = lib.mkDefault true;
    extraPortals = with pkgs; [
      xdg-desktop-portal-hyprland
      xdg-desktop-portal-gtk
    ];
  };
  
  # Explicitly disable X11 services (Wayland-only setup)
  services.xserver.enable = false;
}
