{ config, pkgs, lib, ... }:
{
  services.xserver.enable = true;
  services.xserver.videoDrivers = [ "nvidia" ];
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
