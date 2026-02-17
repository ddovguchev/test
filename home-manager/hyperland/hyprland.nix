{ config, pkgs, lib, ... }:
let
  agsRequestApps = pkgs.writeShellScript "ags-request-apps" ''
    AGS="${config.home.profileDirectory}/bin/ags"
    if ! "$AGS" request apps; then
      systemctl --user start ags.service
      sleep 0.2
      "$AGS" request apps
    fi
  '';

  agsRequestWallpaper = pkgs.writeShellScript "ags-request-wallpaper" ''
    AGS="${config.home.profileDirectory}/bin/ags"
    if ! "$AGS" request wallpaper; then
      systemctl --user start ags.service
      sleep 0.2
      "$AGS" request wallpaper
    fi
  '';

  agsRequestWorkspaces = pkgs.writeShellScript "ags-request-workspaces" ''
    AGS="${config.home.profileDirectory}/bin/ags"
    if ! "$AGS" request workspaces; then
      systemctl --user start ags.service
      sleep 0.2
      "$AGS" request workspaces
    fi
  '';
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
        gaps_in = 6;
        gaps_out = 10;
      };
      decoration = {
        rounding = 14;
        active_opacity = 1.0;
        inactive_opacity = 1.0;
        blur = {
          enabled = true;
          size = 10;
          passes = 3;
          ignore_opacity = true;
          new_optimizations = true;
        };
      };
      input = {
        kb_layout = "us,ru";
        kb_options = "grp:alt_shift_toggle";
      };
      misc = {
        vrr = 0;
      };
      animations = {
        enabled = false;
      };
      exec-once = [
        "swww-daemon"
      ] ++ lib.optional hasXwaylandVideoBridge "xwaylandvideobridge";
      bind = [
        "$mod, F, exec, firefox"
        "$mod, T, exec, kitty"
        "$mod, R, exec, ${agsRequestApps}"
        "$mod, W, exec, ${agsRequestWorkspaces}"
        "$mod SHIFT, W, exec, ${agsRequestWallpaper}"
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
  };
}
