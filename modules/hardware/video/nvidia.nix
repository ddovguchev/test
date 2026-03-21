# Драйвер NVIDIA (проприетарный). Не путать с Nouveau («GNU»/свободный).
# Проверка: nvidia-smi, lsmod | grep nvidia, lspci -k | grep -A3 VGA
# Для 200 Hz: монитор должен быть подключён к разъёму ВИДЕОКАРТЫ NVIDIA, а не к материнской плате (iGPU).
{
  lib,
  pkgs,
  config,
  ...
}:
let
  nvidiaDriverChannel = config.boot.kernelPackages.nvidiaPackages.stable; # stable, latest, beta
in
{
  environment.sessionVariables = lib.optionalAttrs config.programs.hyprland.enable {
    GBM_BACKEND = "nvidia-drm";
    WLR_NO_HARDWARE_CURSORS = "1";
    LIBVA_DRIVER_NAME = "nvidia";
    __GLX_VENDOR_LIBRARY_NAME = "nvidia";
    __GL_GSYNC_ALLOWED = "1";
    __GL_VRR_ALLOWED = "1";
    __GL_MaxFramesAllowed = "1";
  };

  services.xserver.videoDrivers = [ "nvidia" ];
  boot.kernelParams = lib.optionals (lib.elem "nvidia" config.services.xserver.videoDrivers) [
    "nvidia-drm.modeset=1"
    "nvidia_drm.fbdev=1"
    "nvidia.NVreg_RegistryDwords=RmEnableAggressiveVblank=1"
  ];
  # RTX 5060 Ti (Blackwell) работает только с открытым модулем. С ядром 6.19 open не собирается — в boot.nix стоит linuxPackages_6_15.
  hardware = {
    nvidia = {
      open = true;
      nvidiaSettings = true;
      nvidiaPersistenced = true;
      powerManagement.enable = true;
      modesetting.enable = true;
      package = nvidiaDriverChannel;
    };
    graphics = {
      enable = true;
      enable32Bit = true;
      extraPackages = with pkgs; [
        nvidia-vaapi-driver
        libva-vdpau-driver
        libvdpau-va-gl
      ];
    };
  };
  nixpkgs.config = {
    nvidia.acceptLicense = true;
    allowUnfree = true;
    allowUnfreePredicate = pkg:
      (lib.getName pkg) == "nvidia"
      || lib.hasPrefix "nvidia" (lib.getName pkg)
      || builtins.elem (lib.getName pkg) [
        "cudatoolkit"
        "nvidia-persistenced"
        "nvidia-settings"
        "nvidia-x11"
      ];
  };
}
