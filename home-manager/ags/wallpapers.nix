{ lib, ... }:
let
  candidates = [
    ../wallpapers
    ../wallpapper
    ./config/assets/wallpapers
  ];

  wallpapersDir = lib.findFirst builtins.pathExists null candidates;

  isSupportedImage = name:
    let lower = lib.toLower name;
    in
      lib.hasSuffix ".jpg" lower
      || lib.hasSuffix ".jpeg" lower
      || lib.hasSuffix ".png" lower
      || lib.hasSuffix ".webp" lower
      || lib.hasSuffix ".bmp" lower;

  wallpaperFiles = if wallpapersDir == null then [ ] else
    builtins.filter
      (name:
        (builtins.readDir wallpapersDir)."${name}" == "regular"
        && isSupportedImage name
      )
      (builtins.attrNames (builtins.readDir wallpapersDir));

  wallpaperTargets = builtins.listToAttrs (map
    (name: {
      name = "Pictures/${name}";
      value.source = "${wallpapersDir}/${name}";
    })
    wallpaperFiles);
in
{
  home.file = lib.mkIf (wallpapersDir != null) wallpaperTargets;
}
