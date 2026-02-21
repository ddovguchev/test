{ config, pkgs, ... }:
{
  systemd.user.services = {
    ags = {
      Unit = {
        Description = "Aylur's GTK Shell";
        After = [ "graphical-session.target" ];
      };
      serviceConfig = {
        ExecStart = "/run/current-system/sw/bin/ags";
        Restart = "on-failure";
      };
      wantedBy = [ "default.target" ];
    };

    swww-daemon = {
      Unit = {
        Description = "Swww Wallpaper Daemon";
        After = [ "graphical-session.target" ];
      };
      serviceConfig = {
        ExecStart = "/run/current-system/sw/bin/swww-daemon";
        Restart = "on-failure";
      };
      wantedBy = [ "default.target" ];
    };
  };
}
