{ config, pkgs, lib, ... }:
{
  services.pipewire = {
    enable = lib.mkDefault true;
    pulse.enable = lib.mkDefault true;
    alsa.enable = lib.mkDefault true;
    jack.enable = lib.mkDefault false;
  };
  security.rtkit.enable = lib.mkDefault true;
}
