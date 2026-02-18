{ config, settings, pkgs, lib, ... }:
let
  details = settings.themeDetails;
in
{
  imports = lib.optionals (details.btopTheme != null) [
    ./${settings.theme}.nix
  ];

  programs.btop = {
    enable = true;
    package = pkgs.btop;
    settings = {
      color_theme = lib.mkIf (details.btopTheme != null)
        "${details.btopTheme}.theme";
      theme_background = false;
      vim_keys = true;
      update_ms = 500;
    };
  };
}
