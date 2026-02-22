{ config, pkgs, ... }:
let
  palette = import ../theme/palette.nix;
  k = palette.kitty;
in
{
  programs.kitty = {
    enable = true;
    settings = {
      font_family = "JetBrains Mono";
      bold_font = "JetBrains Mono Bold";
      italic_font = "JetBrains Mono Italic";
      bold_italic_font = "JetBrains Mono Bold Italic";
      shell = "${pkgs.zsh}/bin/zsh";
      window_padding_width = "5 10";
      cursor_trail = 3;
      cursor = k.cursor;
      cursor_text_color = k.cursorText;
      foreground = k.foreground;
      background = k.background;
      selection_foreground = k.selectionForeground;
      selection_background = k.selectionBackground;
      url_color = k.url;
      color0 = k.color0;
      color8 = k.color8;
      color1 = k.color1;
      color9 = k.color9;
      color2 = k.color2;
      color10 = k.color10;
      color3 = k.color3;
      color11 = k.color11;
      color4 = k.color4;
      color12 = k.color12;
      color5 = k.color5;
      color13 = k.color13;
      color6 = k.color6;
      color14 = k.color14;
      color7 = k.color7;
      color15 = k.color15;
    };
  };
}
