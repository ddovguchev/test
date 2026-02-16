{ config, pkgs, lib, ... }:
{
  users.users.hikari = {
    isNormalUser = true;
    description = "Primary user";
    extraGroups = [ 
      "wheel"      # sudo access
      "video"      # video device access
      "audio"      # audio device access
      "networkmanager"  # network management
      "docker"     # docker access (if docker is enabled)
    ];
    shell = pkgs.bash;
    # Uncomment to add SSH keys:
    # openssh.authorizedKeys.keys = [
    #   "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA..."
    # ];
  };

  # Enable sudo with password
  security.sudo.enable = lib.mkDefault true;
  
  # Optional: Enable sudo without password (less secure)
  # security.sudo.wheelNeedsPassword = false;
  
  # Optional: Configure sudoers
  # security.sudo.extraRules = [
  #   {
  #     users = [ "hikari" ];
  #     commands = [ { command = "ALL"; options = [ "NOPASSWD" ]; } ];
  #   }
  # ];
}
