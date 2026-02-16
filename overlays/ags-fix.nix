# Fix AGS v1 (ags_1) on NixOS 25.11: GIRepository 2.0 — вызов через dup_default().
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  # Скрипт патча вынесен в отдельный файл, чтобы не экранировать кавычки в Nix
  patchSh = prev.writeScript "patch-ags-wrapped.sh"
    (builtins.readFile (./. + "/patch-ags-wrapped.sh"));
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.buildPackages.patch ];
    postInstall = (old.postInstall or "") + ''
      [ -f "$out/bin/.ags-wrapped" ] && ${patchSh} "$out/bin/.ags-wrapped" "$out/lib"
    '';
  });
}
