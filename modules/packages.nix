{ config, pkgs, lib, ... }:
{
  environment.systemPackages = with pkgs; [
    git curl wget unzip nodejs_22 nodePackages.typescript
    kubectl k9s helm docker docker-compose
    ansible tmux neovim
    jetbrains.idea
    kitty ranger fastfetch htop
    firefox spotify
    blender qemu terraform terragrunt go gcc
    insomnia discord obs-studio steam
    burpsuite metasploit
    wireguard-tools wireshark teams-for-linux telegram-desktop
    gns3-gui
    hyprlock
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
