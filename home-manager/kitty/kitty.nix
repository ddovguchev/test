{ config, pkgs, ... }:
let
  palette = import ../theme/palette.nix;
in
{
  programs.kitty = {
    enable = true;
    font = {
      e
        name = "JetBrainsMono Nerd Font";
      size = 11.5;
    };
    settings = {
      cursor = palette.kitty.cursor;
      cursor_text_color = palette.kitty.cursorText;
      cursor_shape = "block";
      cursor_stop_blinking_after = 0;
      foreground = palette.kitty.foreground;
      background = palette.kitty.background;
      selection_foreground = palette.kitty.selectionForeground;
      selection_background = palette.kitty.selectionBackground;
      url_color = palette.kitty.url;
      color0 = palette.kitty.color0;
      color8 = palette.kitty.color8;
      color1 = palette.kitty.color1;
      color9 = palette.kitty.color9;
      color2 = palette.kitty.color2;
      color10 = palette.kitty.color10;
      color3 = palette.kitty.color3;
      color11 = palette.kitty.color11;
      color4 = palette.kitty.color4;
      color12 = palette.kitty.color12;
      color5 = palette.kitty.color5;
      color13 = palette.kitty.color13;
      color6 = palette.kitty.color6;
      color14 = palette.kitty.color14;
      color7 = palette.kitty.color7;
      color15 = palette.kitty.color15;
      scrollback_lines = 2000;
      copy_on_select = "yes";
      mouse_hide_wait = 0;
      select_by_word_characters = "@-./_~?&=%+#a";
      enable_audio_bell = false;
      bell_on_tab = "🔔 ";
      remember_window_size = false;
      window_border_width = "1pt";
      draw_minimal_borders = true;
      window_padding_width = 10;
      inactive_text_alpha = 0.6;
      hide_window_decorations = true;
      confirm_os_window_close = 0;
      tab_bar_style = "powerline";
      background_opacity = 0.98;
    };
  };
}
