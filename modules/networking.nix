{ config, pkgs, ... }:
{
  networking.networkmanager.enable = true;
  services.openssh.enable = true;
}
