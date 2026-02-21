let
  kitty = {
    cursor = "#e0e2e8";
    cursorText = "#c2c7ce";
    foreground = "#e0e2e8";
    background = "#101418";
    selectionForeground = "#233240";
    selectionBackground = "#b8c8da";
    url = "#99ccfa";

    color0 = "#4c4c4c";
    color8 = "#262626";
    color1 = "#ac8a8c";
    color9 = "#c49ea0";
    color2 = "#8aac8b";
    color10 = "#9ec49f";
    color3 = "#aca98a";
    color11 = "#c4c19e";
    color4 = "#99ccfa";
    color12 = "#a39ec4";
    color5 = "#ac8aac";
    color13 = "#c49ec4";
    color6 = "#8aacab";
    color14 = "#9ec3c4";
    color7 = "#f0f0f0";
    color15 = "#e7e7e7";
  };

  # Navbar = kitty theme: same fg/bg, no blue accent on border
  navbar = {
    fg = kitty.foreground;
    bg = kitty.background;
    bgOpacity = "rgba(16, 20, 24, 0.75)";
    border = kitty.color8;
    shadow = "rgba(0, 0, 0, 0.4)";
  };
in
{
  inherit kitty navbar;

  ags = {
    barFg = navbar.fg;
    barBg = navbar.bg;
    barBgOpacity = navbar.bgOpacity;
    barBorder = navbar.border;
    barShadow = navbar.shadow;
    panelBg = "rgba(18, 24, 38, 0.72)";
    panelBorder = kitty.color0;
    launcherOverlay = "rgba(16, 20, 24, 0.35)";
    launcherPanel = "rgba(38, 38, 38, 0.72)";
    launcherTile = "rgba(76, 76, 76, 0.45)";
    launcherTileHover = "rgba(153, 204, 250, 0.32)";
    launcherText = kitty.color7;
  };
}
