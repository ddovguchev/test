{ inputs, outputs, config, pkgs, lib, ... }:
{

  imports = [
    ./hardware-configuration.nix
    ../shared
  ];

  home-manager = {
    extraSpecialArgs = { inherit inputs outputs; };
    users.hikari = import ../../home/hikari/home.nix;
  };

  nixpkgs = {
    overlays = [
      outputs.overlays.modifications
      outputs.overlays.additions
      inputs.nur.overlays.default
    ];
    config = {
      allowUnfreePredicate = _: true;
      allowUnfree = true;
    };
  };

  networking.hostName = "crystal";

  boot.blacklistedKernelModules = [ "nouveau" ];

  # RTX 5060 (Blackwell, десктоп): открытый kmod NVIDIA + свежий nixpkgs. Без PRIME — одна дискретная карта.
  # Обязательно: nix flake update && sudo nixos-rebuild boot --flake .#crystal
  hardware.nvidia = {
    modesetting.enable = true;
    powerManagement.enable = true;
    open = true;
    package = config.boot.kernelPackages.nvidiaPackages.beta;
  };

  services.xserver = {
    enable = true;
    videoDrivers = [ "nvidia" ];
    displayManager = {
      startx.enable = true;
    };
    windowManager.dwm = {
      enable = true;
      package = pkgs.dwm.override {
        conf = ../../patches/dwm/config.def.h;
        patches = [
          ../../patches/dwm/alt-tags.diff
          ../../patches/dwm/awm.diff
          ../../patches/dwm/fullscreen.diff
          ../../patches/dwm/systray.diff
          ../../patches/dwm/scratches.diff
          ../../patches/dwm/alttab.diff
          ../../patches/dwm/restartsig.diff
          ../../patches/dwm/restore.diff
          ../../patches/dwm/autostart.diff
          ../../patches/dwm/center.diff
          ../../patches/dwm/statuspadding.diff
          ../../patches/dwm/swallow.diff
          ../../patches/dwm/xresources.diff
          ../../patches/dwm/urgentbor.diff
          ../../patches/dwm/fullgaps.diff
        ];
      };
    };
    libinput = {
      enable = true;
      touchpad = {
        tapping = true;
        middleEmulation = true;
        naturalScrolling = true;
      };
    };
  };
}
