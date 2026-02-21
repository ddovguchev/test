{ pkgs, inputs, lib, ... }:

let
  spicePkgs = inputs.spicetify-nix.legacyPackages.${pkgs.stdenv.hostPlatform.system};

  theme =
    if spicePkgs.themes ? text
    then spicePkgs.themes.text
    else spicePkgs.themes.catppuccin;

  ext = spicePkgs.extensions;
in
{
  programs.spicetify = {
    enable = true;

    theme = theme;
    enabledCustomApps = [ spicePkgs.apps.marketplace ];

    enabledExtensions =
      (lib.optionals (ext ? adblock) [ ext.adblock ])
      ++ (lib.optionals (ext ? marketplace) [ ext.marketplace ]);

    colorScheme = lib.mkIf (!(spicePkgs.themes ? text)) "mocha";
  };
}
