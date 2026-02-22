# config/hypr/configs/autostart.conf
{ ... }:
{
  xwayland.force_zero_scaling = true;
  "exec-once" = [
    "dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=Hyprland"
    "systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP"
    "systemctl --user stop xdg-desktop-portal-hyprland xdg-desktop-portal"
    "systemctl --user start xdg-desktop-portal-hyprland xdg-desktop-portal"
    "wl-paste --type text --watch cliphist store"
    "wl-paste --type image --watch cliphist store"
    "systemctl --user start hyprpolkitagent"
    "hypridle"
    "start-navbar"
    "systemctl --user start hyprsunset.service"
    "nm-applet --indicator"
    "bash ~/.config/hypr/scripts/wallpapers/check-video.sh"
    "bash ~/.config/hypr/scripts/start-dashboard.sh &"
    "[workspace 2 silent] kitty"
    "~/.config/hypr/scripts/hypr-nice"
    "sleep 1 && swww-daemon && swww restore &"
  ];
}
