# config/hypr/configs/monitors.conf — сохраняем настройки мониторов
{ lib, ... }:
let
  primaryMonitor = "DP-4";   # основной монитор
  secondaryMonitor = "";    # второй монитор, например "HDMI-A-1"
  monitorsList = if secondaryMonitor == "" then [ "${primaryMonitor}, preferred, auto, 1" ] else [ "${primaryMonitor}, preferred, auto, 1" "${secondaryMonitor}, preferred, auto, 1" ];
in
{
  monitor = monitorsList;
  render.explicit_sync = 0;
  misc.vfr = true;
}
