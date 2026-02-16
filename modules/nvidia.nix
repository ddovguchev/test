{ config, pkgs, lib, ... }:
{
  # NVIDIA drivers for Wayland (no X11 needed)
  hardware.nvidia = {
    # Enable kernel modesetting for Wayland
    modesetting.enable = lib.mkDefault true;
    # Use open-source kernel modules (better Wayland support)
    open = lib.mkDefault true;
    # Use stable NVIDIA driver package
    package = lib.mkDefault config.boot.kernelPackages.nvidiaPackages.stable;
  };
  
  # Required environment variables for Wayland + NVIDIA
  environment.sessionVariables = {
    WLR_NO_HARDWARE_CURSORS = "1";
    LIBVA_DRIVER_NAME = "nvidia";
  };
}
