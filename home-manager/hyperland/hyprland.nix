{ config, pkgs, ... }:
{
  wayland.windowManager.hyprland = {
    enable = true;
    settings = let
      home = config.home.homeDirectory;
    in {
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
      ];
      # Задержка, чтобы Wayland был готов; вывод в лог для отладки
      "exec-once" = [
        "bash -c 'sleep 2; ${home}/.local/bin/ags-run >> /tmp/ags-exec.log 2>&1 &'"
      ];
      windowrulev2 = [
        "pin,class:^(com\\.github\\.Aylur\\.ags)$"
        "float,class:^(com\\.github\\.Aylur\\.ags)$"
        "noborder,class:^(com\\.github\\.Aylur\\.ags)$"
      ];
    };
  };
}
