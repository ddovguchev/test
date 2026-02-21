{ config, pkgs, lib, ... }:

let
  firstAttr = paths:
    let xs = builtins.filter (p: lib.hasAttrByPath p pkgs) paths;
    in if xs == [] then null else lib.getAttrFromPath (builtins.head xs) pkgs;

  xwaylandVideoBridge = firstAttr [
    [ "plasma6Packages" "xwaylandvideobridge" ]
    [ "kdePackages" "xwaylandvideobridge" ]
  ];

  codeCursor = firstAttr [
    [ "code-cursor" ]
  ];

  spicetify = firstAttr [
    [ "spicetify-cli" ]
    [ "spicetify" ]
  ];

  vesktopWrapped = lib.hiPrio (pkgs.writeShellScriptBin "vesktop" ''
    exec ${pkgs.vesktop}/bin/vesktop \
      --enable-features=UseOzonePlatform,WebRTCPipeWireCapturer \
      --ozone-platform=wayland \
      "$@"
  '');
in
{
  programs.steam = {
    enable = true;
    gamescopeSession.enable = true; # <-- без s
  };

  programs.gamemode.enable = true;

  environment.systemPackages =
    (with pkgs; [
      # base
      git curl wget unzip ripgrep pciutils htop fastfetch nixpkgs-fmt mangohud protonup-ng

      # dev
      nodejs_22 nodePackages.typescript go gcc terraform terragrunt
      kubectl k9s helm ansible tmux neovim

      # containers/virt
      docker docker-compose qemu

      # apps
      jetbrains.idea kitty ranger firefox spotify blender insomnia obs-studio
      steam burpsuite metasploit

      # network
      wireguard-tools wireshark gns3-gui teams-for-linux telegram-desktop

      # wayland
      hyprlock grim slurp wf-recorder wl-screenrec pavucontrol ffmpeg swww

      # astal
      astal.gjs astal.astal3 astal.io astal.wireplumber astal.notifd
    ])
    ++ [ vesktopWrapped ]
    ++ lib.optional (xwaylandVideoBridge != null) xwaylandVideoBridge
    ++ lib.optional (codeCursor != null) codeCursor
    ++ lib.optional (spicetify != null) spicetify;

  virtualisation.docker = {
    enable = lib.mkDefault true;
    rootless = {
      enable = lib.mkDefault false;
      setSocketVariable = lib.mkDefault true;
    };
  };
}
