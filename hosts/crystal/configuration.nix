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
      inputs.nur.overlay
    ];
    config = {
      allowUnfreePredicate = _: true;
      allowUnfree = true;
    };
  };

  networking.hostName = "crystal";

  # Видео: дискретная NVIDIA; процессор AMD (микрокод в hardware-configuration.nix).
  # При гибриде AMD iGPU + NVIDIA см. hardware.nvidia.prime в документации NixOS.
  hardware.nvidia = {
    modesetting.enable = true;
    powerManagement.enable = true;
    open = false;
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
