{ config, pkgs, lib, ... }:
{
  boot.kernelParams = [
    "nvidia_drm.modeset=1"
    "video=DP-1:2560x1080@200"
  ];
  boot.blacklistedKernelModules = [ "nouveau" ];
  boot.initrd.kernelModules = [ "nvidia" "nvidia_modeset" "nvidia_uvm" "nvidia_drm" ];
  boot.kernelModules = [ "nvidia" "nvidia_modeset" "nvidia_uvm" "nvidia_drm" ];

  hardware.graphics.enable = true;
  hardware.graphics.enable32Bit = true;
  services.xserver.enable = true;
  services.xserver.videoDrivers = [ "nvidia" ];
  hardware.nvidia = {
    modesetting.enable = lib.mkDefault true;
    # RTX 5060 Ti требует открытые модули ядра (open kernel modules)
    open = true;  # ОБЯЗАТЕЛЬНО для RTX 5060 Ti (Blackwell)
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
