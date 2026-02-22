{ config, pkgs, lib, ... }:

let
  primaryMonitor = "DP-4,2560x1080@200,0x0,1";
  secondaryMonitor = "";
  monitorsList = if secondaryMonitor == "" then [ primaryMonitor ] else [ primaryMonitor secondaryMonitor ];
  terminalCmd = "${pkgs.kitty}/bin/kitty";
in
{
  wayland.windowManager.hyprland = {
    enable = true;

    settings = {
      "$terminal" = terminalCmd;
      "$fileManager" = "dolphin";
      "$clipboard" = "cliphist list";
      "$mainMod" = "SUPER";
      "$killPanel" = "swaync-client -cp";
      "$launcher" = "rofi";

      monitor = monitorsList;

      xwayland.force_zero_scaling = true;

      "exec-once" = [
        "dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=Hyprland"
        "systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP"
        "systemctl --user stop xdg-desktop-portal-hyprland xdg-desktop-portal"
        "systemctl --user start xdg-desktop-portal-hyprland xdg-desktop-portal"
        "wl-paste --type text --watch cliphist store"
        "wl-paste --type image --watch cliphist store"
        "systemctl --user start hyprpolkitagent"
        "hypridle"
        "start-navbar"
        "systemctl --user start hyprsunset.service"
        "nm-applet --indicator"
        "bash ~/.config/hypr/scripts/wallpapers/check-video.sh"
        "bash ~/.config/hypr/scripts/start-dashboard.sh &"
        "${terminalCmd}"
        "~/.config/hypr/scripts/hypr-nice"
        "sleep 1 && swww-daemon && swww restore &"
      ];

      general = {
        gaps_in = 5;
        gaps_out = 20;
        border_size = 2;
        resize_on_border = false;
        allow_tearing = false;
        layout = "dwindle";
      };

      decoration = {
        rounding = 10;
        rounding_power = 2;
        active_opacity = 0.825;
        inactive_opacity = 0.3;
        shadow = {
          enabled = true;
          range = 4;
          render_power = 3;
        };
        blur = {
          enabled = true;
          size = 10;
          passes = 2;
          vibrancy = 0.1696;
        };
      };

      dwindle = {
        pseudotile = true;
        preserve_split = true;
      };

      master.new_status = "master";

      misc = {
        vfr = true;
        vrr = 0;
        session_lock_xray = true;
        force_default_wallpaper = 0;
        disable_hyprland_logo = true;
      };

      animations = {
        enabled = true;
        bezier = [
          "wind, 0.05, 0.9, 0.1, 1.05"
          "winIn, 0.1, 1.1, 0.1, 1.1"
          "winOut, 0.3, -0.3, 0, 1"
          "liner, 1, 1, 1, 1"
          "almostLinear, 0.5, 0.5, 0.75, 1.0"
        ];
        animation = [
          "windows, 1, 6, wind, slide"
          "windowsIn, 1, 6, winIn, slide"
          "windowsOut, 1, 5, winOut, slide"
          "windowsMove, 1, 5, wind, slide"
          "border, 1, 1, liner"
          "borderangle, 1, 30, liner, loop"
          "layers, 1, 6, wind, popin 90%"
          "layersIn, 1, 6, winIn, popin 90%"
          "layersOut, 1, 5, winOut, popin 90%"
          "workspaces, 1, 5, wind"
          "fadeIn, 1, 1.73, almostLinear"
          "fadeOut, 1, 1.46, almostLinear"
          "fade, 1, 3.03, almostLinear"
        ];
      };

      input = {
        kb_layout = "us,ru";
        kb_options = "grp:alt_shift_toggle";
        kb_variant = "";
        kb_model = "";
        kb_rules = "";
        follow_mouse = 1;
        sensitivity = 0;
        touchpad.natural_scroll = false;
      };

      debug.disable_logs = false;

      bind = [
        "$mainMod, Z, exec, $terminal"
        "$mainMod, X, killactive"
        "$mainMod ALT, C, exec, $killPanel; pkill $launcher; $launcher-launch run"
        "$mainMod SHIFT, C, exec, $killPanel; pkill $launcher; $launcher-launch game"
        "$mainMod, C, exec, $killPanel; pkill $launcher; $launcher-launch drun"
        "$mainMod, V, exec, $killPanel; pkill $launcher || $clipboard | $launcher -dmenu | cliphist decode | wl-copy"
        "$mainMod, Q, killactive"
        "$mainMod ALT, Q, exec, screenshot window"
        "$mainMod SHIFT, Q, exec, screenshot region"
        "$mainMod, t, exec, $terminal"
        "$mainMod, O, setprop, active opaque toggle"
        "$mainMod, F, fullscreen, 1"
        "$mainMod SHIFT, F, fullscreen, 0"
        "$mainMod ALT, F, togglefloating"
        "$mainMod, P, pseudo"
        "$mainMod, J, togglesplit"
        "$mainMod, N, exec, kill-layers; swaync-client -t"
        "$mainMod, L, exec, loginctl lock-session"
        "$mainMod, B, exec, $killPanel; pkill $launcher || change-navbar-mode"
        "$mainMod SHIFT, W, exec, customize wallpaper random"
        "$mainMod, W, exec, $killPanel; pkill $launcher || customize"
        "$mainMod, left, movefocus, l"
        "$mainMod, right, movefocus, r"
        "$mainMod, up, movefocus, u"
        "$mainMod, down, movefocus, d"
        "$mainMod, 1, workspace, 1"
        "$mainMod, 2, workspace, 2"
        "$mainMod, 3, workspace, 3"
        "$mainMod, 4, workspace, 4"
        "$mainMod, 5, workspace, 5"
        "$mainMod, 6, workspace, 6"
        "$mainMod, 7, workspace, 7"
        "$mainMod, 8, workspace, 8"
        "$mainMod, 9, workspace, 9"
        "$mainMod, 0, workspace, 10"
        "$mainMod SHIFT, 1, movetoworkspace, 1"
        "$mainMod SHIFT, 2, movetoworkspace, 2"
        "$mainMod SHIFT, 3, movetoworkspace, 3"
        "$mainMod SHIFT, 4, movetoworkspace, 4"
        "$mainMod SHIFT, 5, movetoworkspace, 5"
        "$mainMod SHIFT, 6, movetoworkspace, 6"
        "$mainMod SHIFT, 7, movetoworkspace, 7"
        "$mainMod SHIFT, 8, movetoworkspace, 8"
        "$mainMod SHIFT, 9, movetoworkspace, 9"
        "$mainMod SHIFT, 0, movetoworkspace, 10"
        "$mainMod, S, togglespecialworkspace, magic"
        "$mainMod SHIFT, S, movetoworkspace, special:magic"
        "$mainMod, mouse_down, workspace, e+1"
        "$mainMod, mouse_up, workspace, e-1"
      ];

      bindm = [
        "$mainMod, mouse:272, movewindow"
        "$mainMod, mouse:273, resizewindow"
      ];

      bindel = [
        ", XF86AudioRaiseVolume, exec, wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"
        ", XF86AudioLowerVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"
        ", XF86AudioMute, exec, wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"
        ", XF86AudioMicMute, exec, wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"
        ", XF86MonBrightnessUp, exec, brightnessctl -e4 -n2 set 5%+"
        ", XF86MonBrightnessDown, exec, brightnessctl -e4 -n2 set 5%-"
      ];

      bindl = [
        ", XF86AudioNext, exec, playerctl next"
        ", XF86AudioPause, exec, playerctl play-pause"
        ", XF86AudioPlay, exec, playerctl play-pause"
        ", XF86AudioPrev, exec, playerctl previous"
      ];

      workspace = [ "1, layoutopt:orientation:left, monitor:DP-4, default:true" ];
      windowrule = [
        "opacity 1 override, match:title ^(Picture-in-Picture)$"
        "opacity 1 override, match:title ^(Sober)$"
        "match:class ^(fastfetch-grid|clock-grid|cava-grid|btop-grid)$, float on"
        "match:class ^(fastfetch-grid|clock-grid|cava-grid|btop-grid)$, workspace 1"
        "center 1, match:class ^(wofi)$"
        "match:class ^fastfetch-grid$, opacity 0.6 override, move 20 65"
        "match:class ^fastfetch-grid$, size 610 307"
        "match:class ^clock-grid$, opacity 0.6 override, move 650 65"
        "match:class ^clock-grid$, size 610 307"
        "match:class ^cava-grid$, opacity 0.6 override, move 20 392"
        "match:class ^cava-grid$, size 610 307"
        "match:class ^btop-grid$, opacity 0.6 override, move 650 392"
        "match:class ^btop-grid$, size 610 307"
      ];
      layerrule = [
        "match:namespace notifications, blur on"
        "match:namespace notifications, ignore_alpha 0.1"
      ];
    };

    extraConfig = ''
      env = WLR_NO_HARDWARE_CURSORS,1
      gesture = 3, horizontal, workspace
      device {
          name = epic-mouse-v1
          sensitivity = -0.5
      }
      windowrule {
          name = suppress-maximize-events
          match:class = .*
          suppress_event = maximize
      }
      windowrule {
          name = fix-xwayland-drags
          match:class = ^$
          match:title = ^$
          match:xwayland = true
          match:float = true
          match:fullscreen = false
          match:pin = false
          no_focus = true
      }
      windowrule {
          name = move-hyprland-run
          match:class = hyprland-run
          move = 20 monitor_h-120
          float = yes
      }
      env = XCURSOR_SIZE,15
      env = HYPRCURSOR_SIZE,15
      env = XDG_MENU_PREFIX,arch-
      env = XDG_CURRENT_DESKTOP,Hyprland
      env = XDG_SESSION_DESKTOP,Hyprland
      env = XDG_SESSION_TYPE,wayland
      env = QT_QPA_PLATFORM,wayland;xcb
      env = QT_QPA_PLATFORMTHEME,qt6ct
      env = QT_WAYLAND_DISABLE_WINDOWDECORATION,1
      env = CURSOR_FLAGS,wayland
      env = MOZ_ENABLE_WAYLAND,1
    '';
  };

  xdg.configFile."hypr/scripts" = { source = ../config/hypr/scripts; recursive = true; };
  xdg.configFile."hypr/hyprlock" = { source = ../config/hypr/hyprlock; recursive = true; };
  xdg.configFile."hypr/hypridle.conf" = { source = ../config/hypr/hypridle.conf; };
  xdg.configFile."hypr/hyprlock.conf" = { source = ../config/hypr/hyprlock.conf; };
  xdg.configFile."hypr/hyprsunset.conf" = { source = ../config/hypr/hyprsunset.conf; };
}
