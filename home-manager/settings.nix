{ pkgs, ... }:
rec {
  username = "hikari";
  dotfilesDir = "/home/hikari/nixos-flake";
  shell = "zsh";
  editors = [ "neovim" ];
  browsers = [ "zen-browser" "qutebrowser" ];
  wms = [ "hyprland" ];
  preferredEditor = "nvim";
  preferredBrowser = "zen";
  theme = "catppuccin";

  themeDetails = {
    themeName = "catppuccin-mocha";
    wallpaper = "${pkgs.nixos-artwork.wallpapers.catppuccin-mocha}/share/backgrounds/nixos/nixos-wallpaper-catppuccin-mocha.png";
    override = { base00 = "11111b"; };
    btopTheme = "catppuccin";
    opacity = 0.8;
    rounding = 25;
    shadow = false;
    bordersPlusPlus = false;
    shell = "ags";
    ags = {
      theme = {
        palette = { widget = "#25253a"; };
        border = { width = 1; opacity = 96; };
      };
      bar = { curved = true; };
      widget = { opacity = 0; };
    };
    font = "Fira Code Nerd Font";
    fontPkg = pkgs.nerd-fonts.fira-code;
    fontSize = 13;
    icons = "Papirus";
    iconsPkg = pkgs.papirus-icon-theme;
  };

  profileDetails = {
    hyprlandMonitors = [ ",2560x1080@200,0x0,1" ];
  };
}
