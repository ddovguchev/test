{ pkgs, outputs, lib, inputs, ... }:
let
  flake-compat = builtins.fetchTarball "https://github.com/edolstra/flake-compat/archive/master.tar.gz";
  my-python-packages = ps: with ps; [
    material-color-utilities
    numpy
    i3ipc
  ];
in
{
  boot.loader = {
    systemd-boot.enable = false;
    grub.enable = true;
    grub.efiSupport = true;
    grub.device = "nodev";
    grub.darkmatter-theme = {
      enable = true;
      style = "nixos";
    };
  };
  hardware.graphics.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.loader.efi.efiSysMountPoint = "/boot";

  programs.zsh.enable = true;
  programs.nix-ld.enable = true;
  security.pam.services.swaylock = {
    text = ''
      auth include login
    '';
  };
  networking = {
    networkmanager.enable = true;
    firewall.enable = false;
  };

  services.openssh = {
    enable = true;
    settings = {
      PasswordAuthentication = true;
      KbdInteractiveAuthentication = true;
      PermitRootLogin = "no";
    };
  };

  security.sudo.enable = true;
  services.blueman.enable = true;
  location.provider = "geoclue2";

  services.redshift = {
    enable = true;
    brightness = {
      day = "1";
      night = "1";
    };
    temperature = {
      day = 5500;
      night = 3700;
    };
  };

  xdg.portal = {
    enable = true;
    config.common.default = "*";
    extraPortals = [ pkgs.xdg-desktop-portal-gtk pkgs.xdg-desktop-portal-wlr ];
  };

  time = {
    hardwareClockInLocalTime = true;
    timeZone = "Asia/Kolkata";
  };

  i18n.defaultLocale = "en_US.UTF-8";

  console = {
    font = "Lat2-Terminus16";
    useXkbConfig = true;
  };

  users = {
    users.hikari = {
      isNormalUser = true;
      extraGroups = [ "wheel" "networkmanager" "audio" "video" "libvirtd" "adbusers" ];
      packages = with pkgs; [ ];
    };
    defaultUserShell = pkgs.zsh;
  };

  services.pipewire.enable = lib.mkForce false;

  services.pulseaudio.enable = true;
  services.pulseaudio.extraConfig = "load-module module-native-protocol-tcp auth-ip-acl=127.0.0.1";

  hardware.bluetooth = {
    enable = true;
    settings.General = {
      Enable = "Source,Sink,Media,Socket";
      Experimental = true;
    };
    powerOnBoot = true;
  };

  systemd.services.bluetooth.serviceConfig.ExecStart = [
    ""
    "${pkgs.bluez}/libexec/bluetooth/bluetoothd -f /etc/bluetooth/main.conf"
  ];

  security.rtkit.enable = true;
  virtualisation = {
    libvirtd.enable = true;
  };
  services.dbus.enable = true;
  programs.steam.enable = true;
  environment.systemPackages = with pkgs; [
    nodejs
    lutgen
    home-manager
    lua-language-server
    bluez
    android-tools
    direnv
    unzip
    bluez-tools
    inotify-tools
    udiskie
    nil
    xwininfo
    brightnessctl
    networkmanager_dmenu
    (pkgs.python313.withPackages my-python-packages)
    libnotify
    xdg-utils
    gtk3
    niv
    st
    appimage-run
    jq
    spotdl
    osu-lazer
    imgclr
    grim
    slop
    eww
    swaylock-effects
    git
    pstree
    mpv
    xdotool
    spotify
    simplescreenrecorder
    brightnessctl
    pamixer
    dmenu
    nix-prefetch-git
    brillo
    wmctrl
    slop
    ripgrep
    imv
    element-desktop
    maim
    xclip
    wirelesstools
    xf86-input-evdev
    xf86-input-synaptics
    xf86-input-libinput
    xorg-server
    xf86-video-ati
  ];
  security.pam.services.gdm.enableGnomeKeyring = true;

  fonts.packages = with pkgs; [
    material-design-icons
    dosis
    material-symbols
    rubik
    noto-fonts-color-emoji
    google-fonts
    nerd-fonts.iosevka
  ];
  fonts.fontconfig = {
    defaultFonts = {
      sansSerif = [ "Product Sans" ];
      monospace = [ "Iosevka Nerd Font" ];
    };
  };
  fonts.enableDefaultPackages = true;

  environment.shells = with pkgs; [ zsh ];
  programs.dconf.enable = true;

  qt = {
    enable = true;
    platformTheme = "gtk2";
    style = "gtk2";
  };

  services.printing.enable = true;

  services.xserver.xkb = {
    layout = "us";
    variant = "";
  };

  security.polkit.enable = true;

  nix = {
    settings = {
      experimental-features = [ "nix-command" "flakes" ];
      trusted-users = [ "root" "@wheel" ];
      auto-optimise-store = true;
      warn-dirty = false;
      substituters = [ "https://nix-gaming.cachix.org" ];
      trusted-public-keys = [ "nix-gaming.cachix.org-1:nbjlureqMbRAxR1gJ/f3hxemL9svXaZF/Ees8vCUUs4=" ];
    };
    gc = {
      automatic = true;
      options = "--delete-older-than 5d";
    };
    optimise.automatic = true;
  };

  system = {
    copySystemConfiguration = false;
    stateVersion = "22.11";
  };
}
