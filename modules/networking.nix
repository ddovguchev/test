{ config, pkgs, lib, ... }:
{
  # Prefer nftables stack (instead of legacy iptables userspace)
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

  # Enable eBPF runtime support.
  boot.kernel.sysctl = {
    "net.core.bpf_jit_enable" = 1;
    "kernel.unprivileged_bpf_disabled" = 1;
  };

  # Common tools to work with eBPF programs/maps.
  environment.systemPackages = with pkgs; [
    bpftools
    bpftrace
  ];
}
