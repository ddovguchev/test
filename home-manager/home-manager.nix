# Integrated from dotfiles - all features in one config
{ config, pkgs, settings, inputs, ... }:
{
  fonts.fontconfig.enable = false;

  imports = [
    ./themes-home.nix
    ./firefox.nix
    ./wallpapers.nix
    ./ranger/ranger.nix

    # Apps
    ./apps/kitty.nix
    ./apps/git.nix
    ./apps/superfile.nix
    ./apps/zathura.nix
    ./apps/cava.nix
    ./apps/github.nix
    ./apps/neofetch
    ./apps/mangohud.nix
    ./apps/kdeconnect.nix
    ./apps/ssh.nix
    ./apps/tlaplus.nix
    ./apps/latex.nix
    ./apps/btop
    ./apps/mpd

    # Gaming
    ./gaming/nethack.nix
    ./gaming/oss-games.nix
    ./gaming/steam.nix
    ./gaming/lutris.nix

    # Virtualization
    ./virtualization

    # Shell
    ./shells/zsh.nix

    # AGS bar (home-manager/ags)
    ./ags/ags.nix

    # WM
    ./wm/hyprland.nix

    # Editors
    ./editors/neovim

    # Browsers
    ./browsers/zen-browser.nix
    ./browsers/qutebrowser.nix
  ];

  home.sessionVariables = {
    EDITOR = settings.preferredEditor;
    BROWSER = settings.preferredBrowser;
  };

  xdg.enable = true;
}
