# JetBrains IntelliJ IDEA Ultimate (paid; needs JetBrains account / license).
{
  lib,
  pkgs,
  ...
}:
{
  nixpkgs.config.allowUnfreePredicate =
    pkg:
    let
      n = lib.getName pkg;
    in
    n == "idea"
    || n == "idea-ultimate"
    || lib.hasPrefix "jetbrains" n;

  home-manager.sharedModules = [
    (_: {
      home.packages = [ pkgs.jetbrains.idea ];
    })
  ];
}
