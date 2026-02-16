# AGS — официальный home-manager модуль (docs: https://aylur.github.io/ags/guide/nix.html)
{ config, pkgs, inputs, ... }:
{
  imports = [ inputs.ags.homeManagerModules.default ];

  programs.ags = {
    enable = true;
    configDir = ./config;
    extraPackages = with pkgs; [
      inputs.astal.packages.${pkgs.system}.notifd
      inputs.astal.packages.${pkgs.system}.wireplumber
    ];
  };
}
