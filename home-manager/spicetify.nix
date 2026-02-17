{ pkgs, inputs, lib, ... }:
let
  spicePkgs = inputs.spicetify-nix.legacyPackages.${pkgs.stdenv.hostPlatform.system};
  useTextTheme = spicePkgs.themes ? text;
  selectedTheme = if useTextTheme then spicePkgs.themes.text else spicePkgs.themes.catppuccin;
  darkThemerExtension =
    if spicePkgs.extensions ? darkThemer then
      [ spicePkgs.extensions.darkThemer ]
    else if spicePkgs.extensions ? darkthemer then
      [ spicePkgs.extensions.darkthemer ]
    else if lib.hasAttr "dark-themer" spicePkgs.extensions then
      [ (builtins.getAttr "dark-themer" spicePkgs.extensions) ]
    else
      [ ];
in
{
  programs.spicetify =
    {
      enable = true;
      theme = selectedTheme;
      enabledCustomApps = with spicePkgs.apps; [ marketplace ];
      enabledExtensions =
        darkThemerExtension
        ++ (lib.optionals (spicePkgs.extensions ? adblock) [ spicePkgs.extensions.adblock ])
        ++ (lib.optionals (spicePkgs.extensions ? marketplace) [ spicePkgs.extensions.marketplace ]);
    }
    // (lib.optionalAttrs (!useTextTheme) {
      colorScheme = "mocha";
    });
}
