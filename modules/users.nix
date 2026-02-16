{ config, pkgs, ... }:
{
  users.users.hikari = {
    isNormalUser = true;
    extraGroups = [ "wheel" "video" "audio" "networkmanager" ];
    shell = pkgs.bash;
  };

  security.sudo.enable = true;
}
