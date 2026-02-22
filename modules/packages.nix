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

  # faugus вызывает umu-run по абсолютному пути — подменяем umu-launcher на обёртку с PYTHONPATH
  # faugus в nixpkgs может быть собран под python 3.12 или 3.13 — добавляем оба пути
  faugusLib = "${pkgs.faugus-launcher}/lib";
  umuRunWithFaugus = pkgs.writeShellScriptBin "umu-run" ''
    for d in python3.12/site-packages python3.13/site-packages; do
      [ -d "${faugusLib}/$d" ] && export PYTHONPATH="${faugusLib}/$d''${PYTHONPATH:+:$PYTHONPATH}" && break
    done
    exec ${pkgs.umu-launcher}/bin/umu-run "$@"
  '';
  faugusLauncherWrapped = pkgs.faugus-launcher.override { umu-launcher = umuRunWithFaugus; };
in
{
  programs.steam = {
    enable = true;
    gamescopeSession.enable = true; # <-- без s
  };

  programs.gamemode.enable = true;

  environment.systemPackages =
    (with pkgs; [
      git curl wget unzip ripgrep pciutils htop fastfetch nixpkgs-fmt mangohud protonup-ng

      nodejs_22 nodePackages.typescript go gcc terraform terragrunt
      kubectl k9s helm ansible tmux neovim

      docker docker-compose qemu

      jetbrains.idea kitty ranger firefox spotify blender insomnia obs-studio
      steam burpsuite metasploit xdg-user-dirs
      faugusLauncherWrapped

      wireguard-tools wireshark gns3-gui teams-for-linux telegram-desktop

      hyprlock grim slurp wf-recorder wl-screenrec pavucontrol ffmpeg swww

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
