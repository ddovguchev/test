{ config, pkgs, lib, ... }:
{
  systemd.user.services = {
    ags = {
      Unit = {
        Description = "Aylur's GTK Shell";
        After = [ "graphical-session.target" ];
      };
      Service = {
        ExecStart = "${config.home.profileDirectory}/bin/ags";
        Restart = "on-failure";
      };
      wantedBy = [ "default.target" ];
    };

    swww-daemon = {
      Unit = {
        Description = "Swww Wallpaper Daemon";
        After = [ "graphical-session.target" ];
      };
      Service = {
        ExecStart = "${pkgs.swww}/bin/swww-daemon";
        Restart = "on-failure";
      };
      wantedBy = [ "default.target" ];
    };
  };
}
