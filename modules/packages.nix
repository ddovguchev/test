{ config, pkgs, lib, ... }:
{
  # System packages organized by category
  environment.systemPackages = with pkgs; [
    # Development tools
    git
    curl
    wget
    unzip
    vim
    nodejs_22
    nodePackages.typescript
    
    # Kubernetes & Container tools
    kubectl
    k9s
    docker
    
    # IDEs & Editors
    jetbrains.idea
    vscode
    
    # Terminal & Shell
    kitty
    ranger
    fastfetch
    htop
    
    # Desktop & GUI
    firefox
    spotify
    ags
    astal.gjs
    astal.astal3
    astal.io
    astal.wireplumber
    astal.notifd
  ];

  # Enable Docker service
  virtualisation.docker.enable = lib.mkDefault true;
  
  # Enable Docker rootless (more secure)
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
