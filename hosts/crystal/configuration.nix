{ inputs, outputs, config, pkgs, lib, ... }:

let
  profiles = import ../../profiles { inherit lib pkgs; };

  customDwm = pkgs.dwm.override {
    conf = ../../patches/dwm/config.def.h;
    patches = import ./dwm-patches.nix { inherit pkgs; };
  };

  # Отдельный бинарник на профиль: greetd/tuigreet вызывает его как Wayland-сессию или X-клиент.
  sessionBins = lib.mapAttrs (
    id: p:
    if p.kind == "wayland" then
      pkgs.writeShellScriptBin "hikari-session-${id}" ''
        set -a
        [ -r /etc/hikari/profiles/${id}.env ] && . /etc/hikari/profiles/${id}.env
        set +a
        exec ${pkgs.niri}/bin/niri-session
      ''
    else
      pkgs.writeShellScriptBin "hikari-session-${id}" ''
        set -a
        [ -r /etc/hikari/profiles/${id}.env ] && . /etc/hikari/profiles/${id}.env
        set +a
        # tuigreet оборачивает X-сессии в startx /usr/bin/env -S <Exec> — startx внутри не нужен
        xrdb -merge "$HOME/.Xresources" 2>/dev/null || true
        [ -x "$HOME/.dwm/autostart.sh" ] && "$HOME/.dwm/autostart.sh"
        exec dbus-run-session ${customDwm}/bin/dwm
      ''
  ) profiles;

  waylandSessions = pkgs.runCommand "hikari-wayland-sessions" { } ''
    mkdir -p $out
    ${lib.concatStringsSep "\n" (
      lib.mapAttrsToList (
        id: p:
        lib.optionalString (p.kind == "wayland") ''
          printf '%s\n' '[Desktop Entry]' 'Name=${p.label}' 'Comment=Wayland (niri)' \
            'Exec=${sessionBins.${id}}/bin/hikari-session-${id}' 'Type=Application' \
            > "$out/${id}.desktop"
        ''
      ) profiles
    )}
  '';

  xsessions = pkgs.runCommand "hikari-xsessions" { } ''
    mkdir -p $out
    ${lib.concatStringsSep "\n" (
      lib.mapAttrsToList (
        id: p:
        lib.optionalString (p.kind == "x11") ''
          printf '%s\n' '[Desktop Entry]' 'Name=${p.label}' 'Comment=X11 (dwm)' \
            'Exec=${sessionBins.${id}}/bin/hikari-session-${id}' 'Type=Application' \
            > "$out/${id}.desktop"
        ''
      ) profiles
    )}
  '';

in

{
  imports = [
    ./hardware-configuration.nix
    ../shared
  ];

  home-manager = {
    extraSpecialArgs = { inherit profiles inputs outputs; };
    users.hikari = import ../../home/hikari/home.nix;
  };

  nixpkgs = {
    overlays = [
      outputs.overlays.modifications
      outputs.overlays.additions
      inputs.nur.overlays.default
    ];
    config = {
      allowUnfreePredicate = _: true;
      allowUnfree = true;
    };
  };

  networking.hostName = "crystal";

  boot.blacklistedKernelModules = [ "nouveau" ];

  hardware.nvidia = {
    modesetting.enable = true;
    powerManagement.enable = true;
    open = true;
    package = config.boot.kernelPackages.nvidiaPackages.beta;
  };

  programs.niri.enable = true;

  environment.systemPackages = [ customDwm ] ++ (lib.attrValues sessionBins);

  environment.etc = lib.mapAttrs' (
    id: p:
    lib.nameValuePair "hikari/profiles/${id}.env" {
      text = ''
        export HIKARI_PROFILE=${lib.escapeShellArg id}
        export TERMINAL=${lib.escapeShellArg (lib.getExe p.terminal)}
        export BROWSER=${lib.escapeShellArg (lib.getExe p.browser)}
        export LANG=${lib.escapeShellArg p.locale}
      '';
    }
  ) profiles;

  services.greetd = {
    enable = true;
    useTextGreeter = true;
    settings.default_session.command =
      "${pkgs.tuigreet}/bin/tuigreet --time --remember --sessions ${waylandSessions} --xsessions ${xsessions}";
  };

  services.xserver = {
    enable = true;
    videoDrivers = [ "nvidia" ];
    displayManager.startx.enable = false;
    windowManager.dwm.enable = false;
  };

  services.libinput = {
    enable = true;
    touchpad = {
      tapping = true;
      middleEmulation = true;
      naturalScrolling = true;
    };
  };
}
