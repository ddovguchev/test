{ config, pkgs, ... }:
{
  programs.kitty = {
    enable = true;
    font = {
      name = "JetBrainsMono Nerd Font";
      size = 11.5;
    };

    settings = {
      # Cursor
      cursor = "#e0e2e8";
      cursor_text_color = "#c2c7ce";
      cursor_shape = "block";
      cursor_stop_blinking_after = 0;

      # Colors
      foreground = "#e0e2e8";
      background = "#101418";
      selection_foreground = "#233240";
      selection_background = "#b8c8da";
      url_color = "#99ccfa";

      # Black
      color0 = "#4c4c4c";
      color8 = "#262626";

      # Red
      color1 = "#ac8a8c";
      color9 = "#c49ea0";

      # Green
      color2 = "#8aac8b";
      color10 = "#9ec49f";

      # Yellow
      color3 = "#aca98a";
      color11 = "#c4c19e";

      # Blue
      color4 = "#99ccfa";
      color12 = "#a39ec4";

      # Magenta
      color5 = "#ac8aac";
      color13 = "#c49ec4";

      # Cyan
      color6 = "#8aacab";
      color14 = "#9ec3c4";

      # White
      color7 = "#f0f0f0";
      color15 = "#e7e7e7";

      # Scrollback and copy
      scrollback_lines = 2000;
      copy_on_select = "yes";
      mouse_hide_wait = 0;
      select_by_word_characters = "@-./_~?&=%+#a";

      # Bell
      enable_audio_bell = false;
      bell_on_tab = "🔔 ";

      # Window
      remember_window_size = false;
      window_border_width = "1pt";
      draw_minimal_borders = true;
      window_padding_width = 10;
      inactive_text_alpha = 0.6;
      hide_window_decorations = true;
      confirm_os_window_close = 0;

      # Tab bar
      tab_bar_style = "powerline";
      background_opacity = 0.98;
    };
  };
}
