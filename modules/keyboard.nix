{ config, pkgs, ... }:
{
  console.keyMap = "us";
  services.xserver.xkb = {
    layout = "us,ru";
    options = "grp:alt_shift_toggle";
  };
}
