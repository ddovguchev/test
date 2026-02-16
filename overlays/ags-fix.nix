# Fix AGS v1 (ags_1) on NixOS 25.11:
# 1) В Nix build пропускаем блок tsc в post_install.sh (NIX_BUILD_TOP есть только в Nix)
# 2) Патч GIRepository 2.0: prepend_search_path у экземпляра dup_default()
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  patchWrapped = prev.writeScript "patch-ags-wrapped.sh"
    (builtins.readFile (./. + "/patch-ags-wrapped.sh"));
  patchPostInstall = prev.writeScript "patch-post-install.sh"
    (builtins.readFile (./. + "/patch-post-install.sh"));
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.buildPackages.gnused ];
    postPatch = (old.postPatch or "") + ''
      ${prev.bash}/bin/bash ${patchPostInstall}
    '';
    postInstall = (old.postInstall or "") + ''
      w="$out/bin/.ags-wrapped"
      if [ -e "$w" ]; then
        target="$(readlink -f "$w" 2>/dev/null || true)"
        [ -n "$target" ] && [ -f "$target" ] && w="$target"
        ${patchWrapped} "$w" || true
      fi
    '';
  });
}
