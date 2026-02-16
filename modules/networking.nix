{ config, pkgs, lib, ... }:
{
  # NetworkManager for network configuration
  networking.networkmanager.enable = lib.mkDefault true;
  
  # Enable OpenSSH server
  services.openssh = {
    enable = lib.mkDefault true;
    settings = {
      # Security improvements
      PermitRootLogin = lib.mkDefault "no";
      PasswordAuthentication = lib.mkDefault true;
      # Uncomment for key-only authentication:
      # PasswordAuthentication = false;
      # KbdInteractiveAuthentication = false;
    };
    # Open firewall ports for SSH
    openFirewall = lib.mkDefault true;
  };
  
  # Firewall configuration
  networking.firewall = {
    enable = lib.mkDefault true;
    # Allow SSH
    allowedTCPPorts = [ ];
    allowedUDPPorts = [ ];
  };
  
  # Optional: Set hostname
  # networking.hostName = "nixos";
  
  # Optional: Configure DNS
  # networking.nameservers = [ "1.1.1.1" "1.0.0.1" ];
}
