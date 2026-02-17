{ config, pkgs, lib, ... }:
let
  ltsKernelPackages =
    if pkgs ? linuxPackages_lts then
      pkgs.linuxPackages_lts
    else if pkgs ? linuxPackages_6_12 then
      pkgs.linuxPackages_6_12
    else
      pkgs.linuxPackages;
in
{
  boot.kernelPackages = ltsKernelPackages;
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
