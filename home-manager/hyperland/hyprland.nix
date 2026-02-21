{ config, pkgs, lib, ... }:

let
  layout = import ../theme/layout.nix;
  hasXwaylandVideoBridge =
    lib.hasAttrByPath [ "plasma6Packages" "xwaylandvideobridge" ] pkgs
    || lib.hasAttrByPath [ "kdePackages" "xwaylandvideobridge" ] pkgs;
in
{
  wayland.windowManager.hyprland = {
    enable = true;

    settings = {
      "$mod" = "SUPER";

      monitor = [
        "DP-4,2560x1080@200,0x0,1"
        ",highrr,auto,1"
      ];

      general = {
        gaps_in = 0;
        gaps_out = layout.navbarGap;
        border_size = 0;
      };

      decoration = {
        rounding = 14;
        active_opacity = 1.0;
        inactive_opacity = 1.0;
        blur = {
          enabled = true;
          size = 20;
          passes = 3;
          ignore_opacity = true;
          new_optimizations = true;
        };
      };

      input = {
        kb_layout = "us,ru";
        kb_options = "grp:alt_shift_toggle";
      };

      misc.vrr = 0;
      animations.enabled = false;

      exec-once =
        lib.optional hasXwaylandVideoBridge "xwaylandvideobridge";

      bind = [
        "$mod, F, exec, firefox"
        "$mod, T, exec, kitty"
        "$mod, Q, killactive"
        "$mod, 1, workspace, 1"
        "$mod, 2, workspace, 2"
        "$mod, 3, workspace, 3"
        "$mod, 4, workspace, 4"
        "$mod, 5, workspace, 5"
        "$mod, 6, workspace, 6"
        "$mod, 7, workspace, 7"
        "$mod, 8, workspace, 8"
        "$mod, 9, workspace, 9"
        "$mod, S, workspace, previous"
        "$mod SHIFT, 1, movetoworkspace, 1"
        "$mod SHIFT, 2, movetoworkspace, 2"
        "$mod SHIFT, 3, movetoworkspace, 3"
        "$mod SHIFT, 4, movetoworkspace, 4"
        "$mod SHIFT, 5, movetoworkspace, 5"
        "$mod SHIFT, 6, movetoworkspace, 6"
        "$mod SHIFT, 7, movetoworkspace, 7"
        "$mod SHIFT, 8, movetoworkspace, 8"
        "$mod SHIFT, 9, movetoworkspace, 9"
      ];

      windowrule = [
        "match:class .*, opacity 0.92 0.88"
        "match:class com\\.github\\.Aylur\\.ags, pin on"
        "match:class com\\.github\\.Aylur\\.ags, float on"
        "match:class com\\.github\\.Aylur\\.ags, border_size 0"
        "match:class com\\.github\\.Aylur\\.ags, opacity 1 1"
        "match:title Picture-in-Picture, float on"
        "match:title Picture-in-Picture, pin on"
        "match:title Picture-in-Picture, size 480 270"
        "match:title Picture-in-Picture, move 100%-w-20 100%-h-20"
      ];

    };

    extraConfig = ''
      layerrule {
        match:namespace = gtk4-layer-shell
        blur = on
        ignorealpha = 0
      }
      blurls = com\\.github\\.Aylur\\.ags
    '';
  };
}
