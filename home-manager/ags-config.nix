{ config, pkgs, inputs, ... }:
let
  system = pkgs.stdenv.hostPlatform.system;
  asztal = pkgs.callPackage ./ags-config/default.nix {
    inherit inputs;
    inherit system;
  };
in
{
  home.packages = [ asztal ];

  systemd.user.services.ags = {
    Unit = {
      Description = "AGS bar (asztal)";
      PartOf = [ "graphical-session.target" ];
      After = [ "graphical-session-pre.target" ];
    };
    Service = {
      ExecStart = "${asztal}/bin/asztal";
      Restart = "on-failure";
      RestartSec = 2;
      KillMode = "mixed";
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
  };
}
