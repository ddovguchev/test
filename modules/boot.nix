{ config, pkgs, lib, ... }:
{
  boot.loader.systemd-boot = {
    enable = lib.mkDefault true;
    configurationLimit = lib.mkDefault 10;
    editor = lib.mkDefault false;
  };
  boot.loader.efi = {
    canTouchEfiVariables = lib.mkDefault true;
    efiSysMountPoint = lib.mkDefault "/boot";
  };
}
