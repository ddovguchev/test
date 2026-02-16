{ config, pkgs, lib, ... }:
{
  # NVIDIA drivers for Wayland (no X11 needed)
  hardware.nvidia = {
    modesetting.enable = lib.mkDefault true;
    open = lib.mkDefault true;
    package = lib.mkDefault config.boot.kernelPackages.nvidiaPackages.stable;
  };

  environment.sessionVariables = {
    WLR_NO_HARDWARE_CURSORS = "1";
    LIBVA_DRIVER_NAME = "nvidia";
  };
}
