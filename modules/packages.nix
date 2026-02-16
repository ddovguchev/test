{ config, pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    kubectl
    k9s
    ranger
    docker
    spotify
    jetbrains.idea
    fastfetch
    htop
    firefox
    kitty
    vscode
    vim
    git
    curl
    wget 
    unzip
    ags_1
  ];
}
