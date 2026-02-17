{ config, pkgs, lib, ... }:
{
  boot.kernelParams = [ "nvidia_drm.modeset=1" ];
  boot.blacklistedKernelModules = [ "nouveau" ];
  boot.initrd.kernelModules = [ "nvidia" "nvidia_modeset" "nvidia_uvm" "nvidia_drm" ];
  boot.kernelModules = [ "nvidia" "nvidia_modeset" "nvidia_uvm" "nvidia_drm" ];

  hardware.graphics.enable = true;
  services.xserver.enable = true;
  services.xserver.videoDrivers = [ "nvidia" ];
  hardware.nvidia = {
    modesetting.enable = lib.mkDefault true;
    # Proprietary kernel module is usually the most reliable on desktop NVIDIA.
    open = lib.mkDefault false;
    # Use production branch for maximum compatibility.
    package = lib.mkDefault config.boot.kernelPackages.nvidiaPackages.production;
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
