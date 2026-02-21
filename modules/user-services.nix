{ config, pkgs, ... }:

{
  systemd.user.services = {
    ags = {
      description = "Aylur's GTK Shell";
      after = [ "graphical-session.target" ];
      wantedBy = [ "default.target" ];

      serviceConfig = {
        ExecStart = "${pkgs.ags}/bin/ags";
        Restart = "on-failure";
      };
    };

    swww = {
      description = "swww wallpaper daemon";
      after = [ "graphical-session.target" ];
      wantedBy = [ "default.target" ];

      serviceConfig = {
        ExecStart = "${pkgs.swww}/bin/swww-daemon";
        Restart = "on-failure";
      };
    };
  };
}
