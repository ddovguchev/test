# config/hypr/configs/appearance.conf (without wallust source — that goes in extraConfig)
{ ... }:
{
  general = {
    gaps_in = 5;
    gaps_out = 20;
    border_size = 2;
    resize_on_border = false;
    allow_tearing = false;
    layout = "dwindle";
  };
  decoration = {
    rounding = 10;
    rounding_power = 2;
    active_opacity = 0.825;
    inactive_opacity = 0.3;
    shadow = {
      enabled = true;
      range = 4;
      render_power = 3;
    };
    blur = {
      enabled = true;
      size = 10;
      passes = 2;
      vibrancy = 0.1696;
    };
  };
  dwindle = {
    pseudotile = true;
    preserve_split = true;
  };
  master.new_status = "master";
  misc = {
    session_lock_xray = true;
    force_default_wallpaper = 0;
    disable_hyprland_logo = true;
  };
}
