{ config, pkgs, lib, ... }:
{
  environment.systemPackages = with pkgs; [
    git curl wget unzip vim nodejs_22 nodePackages.typescript
    kubectl k9s docker
    jetbrains.idea
    kitty ranger fastfetch htop
    firefox spotify
    blender qemu terraform terragrunt go gcc
    insomnia discord obs-studio steam
    wireguard-tools wireshark teams-for-linux telegram-desktop
    gns3-gui
    pulseaudio
    pavucontrol
    ffmpeg
    swww
    astal.gjs astal.astal3 astal.io astal.wireplumber astal.notifd
  ];
  virtualisation.docker.enable = lib.mkDefault true;
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
