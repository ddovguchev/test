{ config, pkgs, ... }:
{
  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      "$mod" = "SUPER";
      monitor = "DP-4,2560x1080@200,0x0,1";
      general = {
        gaps_in = 3;
        gaps_out = 5;
      };
      input = {
        kb_layout = "us,ru";
        kb_options = "grp:alt_shift_toggle";
      };
      bind = [
        "$mod, F, exec, firefox"
        "$mod, T, exec, kitty"
        "$mod, Q, killactive"
      ];
      windowrulev2 = [
        "pin,class:^(com\\.github\\.Aylur\\.ags)$"
        "float,class:^(com\\.github\\.Aylur\\.ags)$"
        "noborder,class:^(com\\.github\\.Aylur\\.ags)$"
      ];
    };
  };
}
