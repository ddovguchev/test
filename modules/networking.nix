{ config, pkgs, lib, ... }:
{
  networking.nftables.enable = true;

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

  boot.kernel.sysctl = {
    "net.core.bpf_jit_enable" = 1;
    "kernel.unprivileged_bpf_disabled" = 1;
  };

  environment.systemPackages = with pkgs; [
    bpftools
    bpftrace
  ];
}
