# config/hypr/configs/monitors.conf — настройки мониторов
{ lib, ... }:
let
  primaryMonitor = "DP-4,2560x1080@200,0x0,1";
  secondaryMonitor = "";
  monitorsList = if secondaryMonitor == "" then [ primaryMonitor ] else [ primaryMonitor secondaryMonitor ];
in
{
  monitor = monitorsList;
  render.explicit_sync = 0;
  misc.vfr = true;
}
