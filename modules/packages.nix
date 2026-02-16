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
    ags_1   # Aylur's Gtk Shell (bar: time + workspaces). Overlay fixes GIRepository 2.0.
  ];

  # Enable Docker service
  virtualisation.docker.enable = lib.mkDefault true;
  
  # Enable Docker rootless (more secure)
  virtualisation.docker.rootless = {
    enable = lib.mkDefault false;
    setSocketVariable = lib.mkDefault true;
  };
}
