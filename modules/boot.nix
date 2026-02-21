{ config, pkgs, lib, ... }:

let
  kernelPackages =
    if pkgs ? linuxPackages_lts then pkgs.linuxPackages_lts
    else if pkgs ? linuxPackages_6_12 then pkgs.linuxPackages_6_12
    else pkgs.linuxPackages;
in
{
  boot.kernelPackages = kernelPackages;

  boot.loader.systemd-boot.enable = false;
  boot.loader.grub = {
    enable = true;
    efiSupport = true;
    device = "nodev";
    configurationLimit = 10;
  };

  boot.loader.efi.canTouchEfiVariables = true;
}
