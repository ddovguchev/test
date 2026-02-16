{ config, pkgs, lib, ... }:
{
  # Use systemd-boot as the boot loader
  boot.loader.systemd-boot = {
    enable = lib.mkDefault true;
    # Configuration editor in boot menu
    configurationLimit = lib.mkDefault 10;
    # Editor mode (space to edit)
    editor = lib.mkDefault false;
  };
  
  # EFI boot loader configuration
  boot.loader.efi = {
    canTouchEfiVariables = lib.mkDefault true;
    # Use EFI system partition
    efiSysMountPoint = lib.mkDefault "/boot";
  };
  
  # Optional: Enable kernel parameter editor
  # boot.loader.systemd-boot.editor = true;
  
  # Optional: Clean up old generations
  # boot.loader.systemd-boot.configurationLimit = 5;
  
  # Optional: Enable kernel hardening
  # boot.kernelParams = [ "loglevel=3" ];
}
