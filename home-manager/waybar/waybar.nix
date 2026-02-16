{ config, pkgs, ... }:
{
  programs.waybar = {
    enable = true;
    settings = {
      mainBar = {
        layer = "top";
        position = "top";
        height = 28;
        spacing = 8;
        modules-left = [ "hyprland/workspaces" ];
        modules-center = [ ];
        modules-right = [ "clock" ];
        "hyprland/workspaces" = {
          disable-scroll = true;
          "on-click" = "activate";
          format = "{id}";
          "format-icons" = {
            default = "";
            active = "";
          };
          sort-by-number = true;
        };
        clock = {
          interval = 1;
          format = "{:%H:%M}";
          tooltip-format = "{:%A, %d %B %Y}";
        };
      };
    };
    style = ''
      * {
        font-family: "JetBrainsMono Nerd Font", sans-serif;
        font-size: 13px;
        border: none;
      }
      window#waybar {
        background-color: rgba(16, 20, 24, 0.95);
        border-bottom: 1px solid rgba(224, 226, 232, 0.15);
        color: #e0e2e8;
      }
      #workspaces button {
        padding: 0 10px;
        min-width: 24px;
        color: #e0e2e8;
        background: transparent;
      }
      #workspaces button:hover {
        background: rgba(224, 226, 232, 0.1);
      }
      #workspaces button.active {
        background: rgba(153, 204, 250, 0.25);
        color: #99ccfa;
      }
      #clock {
        padding: 0 12px;
        color: #e0e2e8;
        font-weight: 500;
      }
    '';
  };
}
