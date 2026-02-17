{ config, pkgs, lib, ... }:
let
  xwaylandVideoBridgePkg =
    if lib.hasAttrByPath [ "plasma6Packages" "xwaylandvideobridge" ] pkgs then
      [ pkgs.plasma6Packages.xwaylandvideobridge ]
    else if lib.hasAttrByPath [ "kdePackages" "xwaylandvideobridge" ] pkgs then
      [ pkgs.kdePackages.xwaylandvideobridge ]
    else
      [ ];
  cursorPkg =
    if lib.hasAttrByPath [ "cursor" ] pkgs then
      [ pkgs.cursor ]
    else
      [ ];
in
{
  environment.systemPackages = (with pkgs; [
    git curl wget unzip nodejs_22 nodePackages.typescript
    nixpkgs-fmt
    kubectl k9s helm docker docker-compose
    ansible tmux neovim
    jetbrains.idea
    kitty ranger fastfetch htop
    firefox spotify
    blender qemu terraform terragrunt go gcc
    insomnia vesktop obs-studio steam
    burpsuite metasploit
    wireguard-tools wireshark teams-for-linux telegram-desktop
    gns3-gui
    hyprlock
    grim slurp wf-recorder wl-screenrec
    pulseaudio
    pavucontrol
    ffmpeg
    swww
    astal.gjs astal.astal3 astal.io astal.wireplumber astal.notifd
  ]) ++ xwaylandVideoBridgePkg ++ cursorPkg;
  virtualisation.docker.enable = lib.mkDefault true;
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
