{ inputs, pkgs, settings, lib, config, ... }:
let
  details = settings.themeDetails;
  asztal = pkgs.callPackage ../../../../ags-config/default.nix
    { inherit inputs; system = pkgs.stdenv.hostPlatform.system; };
  agsColors = {
    wallpaper = details.wallpaper;
    theme = {
      blur = (1 - details.opacity) * 100;
      radius = details.rounding;
      shadows = details.shadow;
      palette = {
        primary = {
          bg = "#${config.lib.stylix.colors.base0D}";
          fg = "#${config.lib.stylix.colors.base00}";
        };
        secondary = {
          bg = "#${config.lib.stylix.colors.base0E}";
          fg = "#${config.lib.stylix.colors.base00}";
        };
        error = {
          bg = "#${config.lib.stylix.colors.base06}";
          fg = "#${config.lib.stylix.colors.base00}";
        };
        bg = "#${config.lib.stylix.colors.base00}";
        fg = "#${config.lib.stylix.colors.base05}";
        widget = "#${config.lib.stylix.colors.base02}";
        border = "#${config.lib.stylix.colors.base02}";
      };
    };
    font = {
      size = settings.themeDetails.fontSize;
      name = settings.themeDetails.font;
    };
    widget = {
      opacity = details.opacity * 100;
    };
  };
  agsOptions = lib.recursiveUpdate agsColors details.ags;
in
{
  imports = [ inputs.ags.homeManagerModules.default ];
  home.packages = with pkgs; [
    asztal
    (pkgs.writeShellScriptBin "ags-run" ''
      exec ${pkgs.ags}/bin/ags run --gtk 4 "$@"
    '')
    bun
    fd
    dart-sass
    gtk3
    pulsemixer
    networkmanager
    pavucontrol
  ];

  programs.ags = {
    enable = true;
    configDir = ../../../../ags-config;
  };

  home.file.".cache/ags/options-nix.json".text = (builtins.toJSON agsOptions);
}
