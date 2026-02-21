{ config, pkgs, lib, ... }:
{
  boot.blacklistedKernelModules = [ "nouveau" ];
  boot.kernelParams = [ "nvidia_drm.modeset=1" ];

  services.xserver.videoDrivers = [ "nvidia" ];

  hardware.graphics = {
    enable = true;
    enable32Bit = true;
  };

  hardware.nvidia = {
    open = false;                     # proprietary
    modesetting.enable = true;
    nvidiaSettings = true;

    # важное: явно выбрать пакет драйвера под текущий kernelPackages
    package = config.boot.kernelPackages.nvidiaPackages.latest;

    # временно лучше выключить, если ловишь NvKms ошибки
    powerManagement.enable = false;
  };

  environment.sessionVariables = {
    LIBVA_DRIVER_NAME = "nvidia";
    __GLX_VENDOR_LIBRARY_NAME = "nvidia";
    NVD_BACKEND = "direct";
  };
}
