{ inputs, config, pkgs, lib, ... }:

let
  colors = import ../shared/cols/vixima.nix { };
  walltype = "image";
in
{
  # some general info  
  home.username = "hikari";
  home.homeDirectory = "/home/hikari";
  home.stateVersion = "22.11";

  programs.home-manager.enable = true;

  home.file.".icons/default".source =
    "${pkgs.phinger-cursors}/share/icons/phinger-cursors";

  home.file.".wallpapers" = {
    source = ../images/walls;
    recursive = true;
  };

  home.file.".local/share/fonts".source = ./fonts;

  # gtk themeing
  gtk = {
    enable = true;
    gtk3.extraConfig.gtk-decoration-layout = "menu:";
    iconTheme.name = "Papirus";
    theme.name = "phocus";
    gtk4.theme = config.gtk.theme;
  };

  nixpkgs.overlays = [
    inputs.nur.overlays.default
  ];

  nixpkgs.config = {
    allowUnfree = true;
    allowInsecure = true;
    allowBroken = true;
    allowUnfreePredicate = _: true;
  };

  nixpkgs.config.permittedInsecurePackages = [
    "electron-25.9.0"
  ];

  home = {
    activation = {
      installConfig = ''
        if [ ! -d "${config.home.homeDirectory}/.config/nvim" ]; then
          ${pkgs.git}/bin/git clone --depth 1 https://github.com/chadcat7/kodo ${config.home.homeDirectory}/.config/nvim
        fi
      '';
    };
    packages = with pkgs; [
      bc
      git-lfs
      feh
      wl-clipboard
      sway-contrib.grimshot
      trash-cli
      xss-lock
      go
      gopls
      playerctl
      (pkgs.callPackage ../../pkgs/icons/papirus.nix { })
      (pkgs.callPackage ../../pkgs/others/phocus.nix { inherit colors; })
      nemo
      i3lock-color
      rust-analyzer
      mpc
      ffmpeg-full
      neovim
      libdbusmenu-gtk3
      xdg-desktop-portal
      imagemagick
      jetbrains.idea-community
      xev
      procps
      obsidian
      redshift
      killall
      moreutils
      wf-recorder
      mpdris2
      socat
      pavucontrol
      fzf
      vesktop
      swww
      swayidle
      autotiling-rs
      pywal
      slurp
      sassc
    ];
  };

  imports = [
    ./profiles-module.nix
    ./conf/ui/niri

    # Importing Configutations
    (import ../shared/xresources.nix { inherit colors; })

    #(import ./conf/utils/swaylock/default.nix { inherit colors pkgs; })
    #(import ./conf/utils/rofi/default.nix { inherit config pkgs colors; })
    (import ./conf/utils/dunst/default.nix { inherit colors pkgs; })

    (import ./conf/browsers/firefox/default.nix { inherit colors pkgs; })
    (import ./conf/browsers/brave/default.nix { inherit pkgs; })

    #(import ./conf/utils/sxhkd/default.nix { })
    #(import ./conf/utils/obs/default.nix { inherit pkgs; })
    #(import ./conf/utils/picom/default.nix { inherit colors pkgs inputs; })

    # Shell
    (import ./conf/shell/zsh/default.nix { inherit config colors pkgs lib; })
    (import ./conf/shell/tmux/default.nix { inherit pkgs; })

    #(import ./conf/ui/hyprland/default.nix { inherit config pkgs lib inputs colors; })
    #(import ./conf/ui/swayfx/default.nix { inherit config pkgs lib colors inputs walltype; })
    #(import ./conf/ui/ags/default.nix { inherit pkgs inputs colors; })

    (import ./conf/term/wezterm/default.nix { inherit pkgs colors; })
    (import ./conf/term/kitty/default.nix { inherit pkgs colors; })

    #(import ./conf/editors/vscopium/default.nix { inherit pkgs colors; })

    # Music thingies
    (import ./conf/music/mpd/default.nix { inherit config pkgs; })
    (import ./conf/music/ncmp/hypr.nix { inherit config pkgs; })
    (import ./conf/music/cava/default.nix { inherit colors; })

    # Some file generation
    (import ./misc/vencord.nix { inherit config colors; })
    (import ./misc/neofetch.nix { inherit config colors; })
    (import ./misc/xinit.nix { inherit colors; })
    (import ./misc/ewwags.nix { inherit config colors; })
    (import ./misc/obsidian.nix { inherit colors; })

    # Bin files
    (import ../shared/bin/default.nix { inherit config colors walltype; })
  ];


}
