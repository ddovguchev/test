{ pkgs, inputs, lib, ... }:
let
  spicePkgs = inputs.spicetify-nix.legacyPackages.${pkgs.stdenv.hostPlatform.system};
in
{
  programs.spicetify = {
    enable = true;
    enabledCustomApps = with spicePkgs.apps; [ marketplace ];
    enabledExtensions = lib.optionals (spicePkgs.extensions ? marketplace) [
      spicePkgs.extensions.marketplace
    ];
  };
}
