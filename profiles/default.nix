# Session profiles: терминал, браузер, тип сессии (Wayland / X11).
# Выбор при логине: greetd → tuigreet. Окружение: /etc/hikari/profiles/<id>.env
{ lib, pkgs }:
{
  niri-wez = {
    id = "niri-wez";
    label = "Niri · Wezterm · Firefox";
    kind = "wayland"; # wayland | x11
    terminal = pkgs.wezterm;
    browser = pkgs.firefox;
    locale = "en_US.UTF-8";
  };

  dwm-wez = {
    id = "dwm-wez";
    label = "dwm · Wezterm · Firefox";
    kind = "x11";
    terminal = pkgs.wezterm;
    browser = pkgs.firefox;
    locale = "en_US.UTF-8";
  };

  niri-kitty = {
    id = "niri-kitty";
    label = "Niri · Kitty · Brave";
    kind = "wayland";
    terminal = pkgs.kitty;
    browser = pkgs.brave;
    locale = "en_US.UTF-8";
  };
}
