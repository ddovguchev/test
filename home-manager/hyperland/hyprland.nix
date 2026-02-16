{ config, pkgs, ... }:
{
  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      "$mod" = "SUPER";
      # Monitor configuration: name, resolution@refresh, position, scale
      # Scale must divide resolution evenly (2560/scale and 1080/scale must be integers)
      # Format: monitor=name,resolution@refresh,position,scale
      # Using string instead of array for single monitor
      monitor = "DP-4,2560x1080@200,0x0,1";
      input = {
        kb_layout = "us,ru";
        kb_options = "grp:alt_shift_toggle";
      };
      bind = [
        "$mod, F, exec, firefox"
        "$mod, T, exec, kitty"
        "$mod, Q, killactive"
        "$mod, B, exec, pkill -x ags 2>/dev/null; sleep 0.3; ~/.local/bin/ags-run &"
      ];
      "exec-once" = [ "~/.local/bin/ags-run" ];
      windowrulev2 = [
        "pin,class:^(com\\.github\\.Aylur\\.ags)$"
        "float,class:^(com\\.github\\.Aylur\\.ags)$"
        "noborder,class:^(com\\.github\\.Aylur\\.ags)$"
      ];
    };
  };
}
