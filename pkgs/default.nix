# Кастомные пакеты (см. overlays).
{ pkgs ? (import ../nixpkgs.nix) { }, inputs }: {
  phospor = pkgs.callPackage ./fonts/phospor.nix { };
  material-symbols = pkgs.callPackage ./fonts/material-symbols.nix { };
  lutgen = pkgs.callPackage ./others/lutgen.nix { };
  imgclr = pkgs.callPackage ./others/imagecolorizer.nix {
    buildPythonPackage = pkgs.python313Packages.buildPythonPackage;
    setuptools = pkgs.python313Packages.setuptools;
    pillow = pkgs.python313Packages.pillow;
  };
}
