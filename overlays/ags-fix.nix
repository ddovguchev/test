# Fix AGS v1 (ags_1) on NixOS 25.11:
# 1) В Nix build пропускаем блок tsc в post_install.sh (NIX_BUILD_TOP есть только в Nix)
# 2) Патч GIRepository 2.0: prepend_search_path у экземпляра dup_default()
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  patchSh = prev.writeScript "patch-ags-wrapped.sh"
    (builtins.readFile (./. + "/patch-ags-wrapped.sh"));
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.buildPackages.gnused ];
    postPatch = (old.postPatch or "") + ''
      sed -i ''"'"'2i [ -n "''${NIX_BUILD_TOP:-}" ] \&\& _skip_tsc=1'"'"' post_install.sh
      sed -i ''"'"'s|if \[\[ "\$5" == "false" \]\]; then|if [[ "\$5" == "false" ]] \|\| [[ -n "\${_skip_tsc:-}" ]]; then|'"'"' post_install.sh
    '';
    postInstall = (old.postInstall or "") + ''
      [ -f "$out/bin/.ags-wrapped" ] && ${patchSh} "$out/bin/.ags-wrapped" || true
    '';
  });
}
