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
    if lib.hasAttrByPath [ "code-cursor" ] pkgs then
      [ pkgs.code-cursor ]
    else
      [ ];
  spicetifyPkg =
    if lib.hasAttrByPath [ "spicetify-cli" ] pkgs then
      [ pkgs."spicetify-cli" ]
    else if lib.hasAttrByPath [ "spicetify" ] pkgs then
      [ pkgs.spicetify ]
    else
      [ ];
  vesktopWrapped = lib.hiPrio (pkgs.writeShellScriptBin "vesktop" ''
    exec ${pkgs.vesktop}/bin/vesktop \
      --enable-features=UseOzonePlatform,WebRTCPipeWireCapturer \
      --ozone-platform=wayland \
      --disable-gpu-compositing \
      --disable-gpu \
      "$@"
  '');
in
{
  programs.steam = {
    enable = true;
  };
  environment.systemPackages = (with pkgs; [
    git
    curl
    wget
    unzip
    nodejs_22
    nodePackages.typescript
    ripgrep
    pciutils
    nixpkgs-fmt
    kubectl
    k9s
    helm
    docker
    docker-compose
    ansible
    tmux
    neovim
    jetbrains.idea
    kitty
    ranger
    fastfetch
    htop
    firefox
    spotify
    blender
    qemu
    terraform
    terragrunt
    go
    gcc
    insomnia
    vesktop
    obs-studio
    steam
    burpsuite
    metasploit
    wireguard-tools
    wireshark
    teams-for-linux
    telegram-desktop
    gns3-gui
    hyprlock
    grim
    slurp
    wf-recorder
    wl-screenrec
    pulseaudio
    pavucontrol
    ffmpeg
    swww
    astal.gjs
    astal.astal3
    astal.io
    astal.wireplumber
    astal.notifd
  ]) ++ [ vesktopWrapped ] ++ xwaylandVideoBridgePkg ++ cursorPkg ++ spicetifyPkg;
  virtualisation.docker.enable = lib.mkDefault true;
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
