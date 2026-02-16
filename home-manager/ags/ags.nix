{ config, pkgs, ... }:
{
  # Deploy AGS (Aylur's Gtk Shell) config to ~/.config/ags
  # Bar: workspaces (1–5) + clock. Package ags_1 is in system packages.
  xdg.configFile."ags/config.js".source = ./config.js;
  xdg.configFile."ags/style.css".source = ./style.css;
}
