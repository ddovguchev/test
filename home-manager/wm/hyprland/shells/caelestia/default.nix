{ inputs, pkgs, settings, lib, config, ... }:
{
  home.packages = with pkgs; [
    inputs.caelestia.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];
}
