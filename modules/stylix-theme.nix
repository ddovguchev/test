# Integrated from dotfiles themes - stylix config
{ pkgs, lib, config, ... }:
let
  details = {
    themeName = "catppuccin-mocha";
    wallpaper = ../home-manager/assets/wallpapers/evening-sky.png;
    override = { base00 = "11111b"; };
    opacity = 0.8;
    font = "Fira Code Nerd Font";
    fontPkg = pkgs.nerd-fonts.fira-code;
    icons = "Papirus";
    iconsPkg = pkgs.papirus-icon-theme;
  };
in
{
  stylix = {
    enable = true;
    polarity = "dark";
    image = details.wallpaper;
    base16Scheme = "${pkgs.base16-schemes}/share/themes/${details.themeName}.yaml";
    override = details.override;
    opacity = {
      terminal = details.opacity;
      applications = details.opacity;
      desktop = details.opacity;
      popups = details.opacity;
    };
    cursor = {
      size = 32;
      name = "phinger-cursors-light";
      package = pkgs.phinger-cursors;
    };
    fonts = {
      sansSerif = {
        package = details.fontPkg;
        name = details.font;
      };
      serif = { package = details.fontPkg; name = details.font; };
      monospace = { package = details.fontPkg; name = details.font; };
      emoji = { package = details.fontPkg; name = details.font; };
    };
  };

  stylix.enableReleaseChecks = false;
}
