{ config, pkgs, lib, ... }:
{
  networking.networkmanager.enable = lib.mkDefault true;
  services.openssh = {
    enable = lib.mkDefault true;
    settings = {
      PermitRootLogin = lib.mkDefault "no";
      PasswordAuthentication = lib.mkDefault true;
    };
    openFirewall = lib.mkDefault true;
  };
  networking.firewall = {
    enable = lib.mkDefault true;
    allowedTCPPorts = [ ];
    allowedUDPPorts = [ ];
  };
}
