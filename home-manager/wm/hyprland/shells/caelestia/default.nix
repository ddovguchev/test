{ inputs, pkgs, settings, lib, config, ... }:
let
in {
<<<<<<< HEAD
  home.packages = with pkgs; [
    inputs.caelestia.packages.${pkgs.system}.default
  ];
=======
    home.packages = with pkgs; [
        inputs.caelestia.packages.${pkgs.stdenv.hostPlatform.system}.default
    ];
>>>>>>> refs/remotes/origin/master
}
