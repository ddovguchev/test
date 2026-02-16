# Fix AGS v1 (ags_1) on NixOS 25.11:
# 1) build_types=false — post_install.sh не запускает tsc в песочнице (иначе сборка падает)
# 2) Патч GIRepository 2.0: prepend_search_path вызывать у экземпляра dup_default()
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  patchSh = prev.writeScript "patch-ags-wrapped.sh"
    (builtins.readFile (./. + "/patch-ags-wrapped.sh"));
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.buildPackages.gnused ];
    # Отключить генерацию типов в post_install.sh (tsc падает в Nix build)
    mesonFlags = (prev.lib.filter (f: !prev.lib.hasInfix "build_types" (toString f)) (old.mesonFlags or []))
      ++ [ (prev.lib.mesonBool "build_types" false) ];
    postInstall = (old.postInstall or "") + ''
      [ -f "$out/bin/.ags-wrapped" ] && ${patchSh} "$out/bin/.ags-wrapped"
    '';
  });
}
