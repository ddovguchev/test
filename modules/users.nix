{ config, pkgs, lib, ... }:
{
  programs.zsh.enable = true;
  users.users.hikari = {
    isNormalUser = true;
    description = "Primary user";
    extraGroups = [ "wheel" "video" "audio" "networkmanager" "docker" ];
    shell = pkgs.zsh;
  };
  security.sudo.enable = lib.mkDefault true;
}
