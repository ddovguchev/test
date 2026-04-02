# niri + waybar + утилиты Wayland.
{ config, pkgs, lib, ... }:

let
  colors = import ../../../../shared/cols/vixima.nix { };
  polkit = "${pkgs.polkit_gnome}/libexec/polkit-gnome-authentication-agent-1";
  homeDir = config.home.homeDirectory;

  niriConfigText = builtins.replaceStrings [ "@POLKIT@" "@HOME@" ] [
    polkit
    homeDir
  ] (builtins.readFile ./niri-main.kdl);

  niriColorsText = import ./colors-kdl.nix { inherit colors; };

  wlogoutLayout = builtins.toJSON [
    {
      label = "shutdown";
      action = "systemctl poweroff";
      text = "Shutdown";
      keybind = "s";
    }
    {
      label = "reboot";
      action = "systemctl reboot";
      text = "Reboot";
      keybind = "r";
    }
    {
      label = "logout";
      action = "loginctl kill-session $XDG_SESSION_ID";
      text = "Logout";
      keybind = "e";
    }
    {
      label = "sleep";
      action = "loginctl lock-session && systemctl suspend";
      text = "Sleep";
      keybind = "h";
    }
    {
      label = "lock";
      action = "${lib.getExe pkgs.swaylock-effects} -f -c #${colors.background}";
      text = "Lock";
      keybind = "l";
    }
  ];

  wlogoutStyle = ''
    @define-color fg #${colors.foreground};
    @define-color bg #${colors.darker}e6;

    window {
      font-family: "Iosevka Nerd Font", sans-serif;
      font-size: 14pt;
      color: @fg;
      background-color: @bg;
    }
    button {
      background-color: transparent;
      border-radius: 24px;
      margin: 8px;
      min-width: 140px;
      min-height: 140px;
    }
    button:focus { background-color: #${colors.accent}40; }
    label { color: @fg; }
  '';

in
{
  home.packages = [
    pkgs.cliphist
    pkgs.wl-clip-persist
    pkgs.wlsunset
    pkgs.wlogout
    pkgs.xwayland-satellite
    pkgs.pamixer
    pkgs.swaylock-effects
    pkgs.networkmanager_dmenu
    (pkgs.writeShellScriptBin "hikari-clip" ''
      set -euo pipefail
      sel=$(${pkgs.cliphist}/bin/cliphist list | ${pkgs.fuzzel}/bin/fuzzel --dmenu)
      [ -z "$sel" ] && exit 0
      echo "$sel" | ${pkgs.cliphist}/bin/cliphist decode | ${pkgs.wl-clipboard}/bin/wl-copy
    '')
  ];

  xdg.configFile."niri/config.kdl".text = niriConfigText;
  xdg.configFile."niri/colors/niri-colors.kdl".text = niriColorsText;

  xdg.configFile."wlogout/layout".text = wlogoutLayout;
  xdg.configFile."wlogout/style.css".text = wlogoutStyle;

  home.file."Pictures/Screenshots/.keep".text = "";

  programs.waybar = {
    enable = true;
    systemd.enable = false;
    settings = [
      {
        layer = "top";
        position = "top";
        margin-left = 10;
        margin-right = 10;
        margin-top = 3;
        modules-left = [
          "clock"
          "niri/workspaces"
        ];
        modules-right = [
          "network"
          "pulseaudio"
          "mpd"
          "custom/power"
        ];

        clock = {
          timezone = "Asia/Kolkata";
          format = "{:%H:%M}";
          tooltip = true;
          "tooltip-format" = "{:%A %d %B %Y}";
          interval = 1;
        };

        "niri/workspaces" = {
          "active-only" = false;
          "all-outputs" = true;
          "on-click" = "activate";
          format = "{icon}";
          "persistent-workspaces" = {
            "*" = [
              1
              2
              3
              4
              5
            ];
          };
          "format-icons" = {
            "1" = "一";
            "2" = "二";
            "3" = "三";
            "4" = "四";
            "5" = "五";
            "6" = "六";
            "7" = "七";
            "8" = "八";
            "9" = "九";
            "10" = "十";
          };
        };

        network = {
          "format-wifi" = "󰤢  {essid}";
          "format-ethernet" = "󰈀 ";
          "format-disconnected" = "󰤠 ";
          interval = 5;
          tooltip = false;
          "on-click" = "${lib.getExe pkgs.networkmanager_dmenu}";
        };

        pulseaudio = {
          format = "{icon}";
          "format-muted" = " ";
          "format-icons" = {
            default = [
              ""
              ""
              " "
            ];
          };
          tooltip = false;
          "on-click" = "${pkgs.pamixer}/bin/pamixer -t";
        };

        mpd = {
          format = "{stateIcon}";
          "format-paused" = "";
          "format-stopped" = "";
          "state-icons" = {
            playing = "";
            paused = "";
            stopped = "";
          };
          "max-length" = 20;
          ellipsis = true;
          tooltip = false;
          "on-click" = "${lib.getExe pkgs.mpc} toggle";
          "on-scroll-up" = "${lib.getExe pkgs.mpc} next";
          "on-scroll-down" = "${lib.getExe pkgs.mpc} prev";
        };

        "custom/power" = {
          format = " ";
          "on-click" = "pkill wlogout || wlogout";
          tooltip = false;
        };
      }
    ];
    style = ''
      * {
        font-family: "Iosevka Nerd Font", "Material Design Icons Desktop", sans-serif;
        font-size: 11.5pt;
        border: none;
        min-height: 0;
      }
      window#waybar {
        background: #${colors.darker};
        color: #${colors.foreground};
        border-radius: 10px;
        margin: 4px 8px;
      }
      #clock,
      #network,
      #pulseaudio,
      #mpd,
      #custom-power {
        padding: 0 10px;
      }
      #workspaces button {
        padding: 0 6px;
        color: #${colors.comment};
      }
      #workspaces button.active {
        color: #${colors.accent};
      }
    '';
  };
}
