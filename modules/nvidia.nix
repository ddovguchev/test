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
    # Blackwell GPUs (like RTX 5060 Ti) require NVIDIA open kernel modules.
    open = true;
    # Pin to the long-lived/production driver branch.
    package =
      let nvidiaPackages = config.boot.kernelPackages.nvidiaPackages;
      in
      if nvidiaPackages ? production then
        nvidiaPackages.production
      else if nvidiaPackages ? stable then
        nvidiaPackages.stable
      else
        nvidiaPackages.latest;
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
