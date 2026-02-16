{ config, pkgs, lib, ... }:
{
  environment.systemPackages = with pkgs; [
    git curl wget unzip vim nodejs_22 nodePackages.typescript
    kubectl k9s docker
    jetbrains.idea vscode
    kitty ranger fastfetch htop
    firefox spotify
    astal.gjs astal.astal3 astal.io astal.wireplumber astal.notifd
  ];
  virtualisation.docker.enable = lib.mkDefault true;
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
