{ config, pkgs, lib, ... }:
{
  services.xserver.enable = true;
  services.xserver.videoDrivers = [ "nvidia" ];
  hardware.nvidia = {
    modesetting.enable = lib.mkDefault true;
    # Proprietary kernel module is usually the most reliable on desktop NVIDIA.
    open = lib.mkDefault false;
    # Prefer newest packaged NVIDIA branch.
    package = lib.mkDefault config.boot.kernelPackages.nvidiaPackages.latest;
    powerManagement.enable = lib.mkDefault true;
    nvidiaSettings = lib.mkDefault true;
  };
  services.power-profiles-daemon.enable = lib.mkDefault true;
  powerManagement.cpuFreqGovernor = lib.mkDefault "schedutil";
  environment.sessionVariables = {
    WLR_NO_HARDWARE_CURSORS = "1";
    LIBVA_DRIVER_NAME = "nvidia";
  };
}
