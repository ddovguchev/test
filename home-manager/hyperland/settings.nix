{ config, pkgs, lib, ... }:
let
  hasXwaylandVideoBridge =
    lib.hasAttrByPath [ "plasma6Packages" "xwaylandvideobridge" ] pkgs
    || lib.hasAttrByPath [ "kdePackages" "xwaylandvideobridge" ] pkgs;
in
{
  home.packages = with pkgs; [
    swww
    wayvnc
    brightnessctl
  ];

  wayland.windowManager.hyprland.settings = {
    monitor = [
      "DP-4,2560x1080@200,0x0,1"
      ",preferred,auto,1"
    ];

    exec-once = [
      "swww-daemon &"
      "ags &"
    ] ++ lib.optional hasXwaylandVideoBridge "xwaylandvideobridge";

    general = {
      gaps_in = 8;
      gaps_out = 16;
      border_size = 2;
      allow_tearing = true;
      "col.active_border" = "rgba(33ccffff)";
      "col.inactive_border" = "rgba(595959aa)";
    };

    cursor = {
      inactive_timeout = 5;
    };

    decoration = {
      dim_special = 0.5;
      rounding = 25;
      blur = {
        enabled = true;
        special = true;
        brightness = 1.0;
        contrast = 1.0;
        noise = 0.02;
        passes = 3;
        size = 10;
      };

      shadow = {
        enabled = false;
        ignore_window = false;
        offset = "2 2";
        range = 20;
        color = "rgba(000000ff)";
      };
    };

    animations = {
      enabled = true;
      bezier = [
        "wind, 0.05, 0.9, 0.1, 1.05"
        "winIn, 0.1, 1.1, 0.1, 1.1"
        "winOut, 0.3, -0.3, 0, 1"
        "liner, 1, 1, 1, 1"
        "workIn, 0.72, -0.07, 0.41, 0.98"
      ];
      animation = [
        "windows, 1, 6, wind, slide"
        "windowsIn, 1, 6, winIn, slide"
        "windowsOut, 1, 5, winOut, slide"
        "windowsMove, 1, 5, wind, slide"
        "border, 1, 1, liner"
        "borderangle, 1, 30, liner, loop"
        "fade, 1, 10, default"
        "workspaces, 1, 5, wind"
        "specialWorkspace, 1, 5, workIn, slidevert"
      ];
    };

    debug = {
      disable_logs = false;
    };

    input = {
      kb_layout = "us,ru";
      kb_options = "grp:alt_shift_toggle";
      follow_mouse = true;
      touchpad = {
        natural_scroll = true;
      };
    };

    device = {
      name = "logitech-usb-receiver-mouse";
      sensitivity = -1.0;
    };

    gestures = {
      workspace_swipe_forever = true;
      workspace_swipe_distance = 200;
    };

    dwindle = {
      # keep floating dimentions while tiling
      pseudotile = true;
      preserve_split = true;
      force_split = 2;
      split_width_multiplier = 1.5;
    };

    misc = {
      force_default_wallpaper = -1;
      exit_window_retains_fullscreen = true;
    };

    windowrulev2 = [
      "opacity 0.92 0.88,class:^(.*)$"
      "pin,class:^(com\\.github\\.Aylur\\.ags)$"
      "float,class:^(com\\.github\\.Aylur\\.ags)$"
      "noborder,class:^(com\\.github\\.Aylur\\.ags)$"
      "float,title:^(Picture-in-Picture|Picture in Picture|Picture-in-picture)$"
      "pin,title:^(Picture-in-Picture|Picture in Picture|Picture-in-picture)$"
      "size 480 270,title:^(Picture-in-Picture|Picture in Picture|Picture-in-picture)$"
      "move 100%-w-20 100%-h-20,title:^(Picture-in-Picture|Picture in Picture|Picture-in-picture)$"
    ];

    layerrule = [
      "blur,^(Bar)$"
      "ignorezero,^(Bar)$"
      "blur,bar"
      "ignorezero,bar"
      "blur,^(bar)$"
      "ignorezero,^(bar)$"
      "blur,ags"
      "ignorezero,ags"
    ];
  };
}

