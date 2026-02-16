# Fix AGS v1 (ags_1) on NixOS 25.11: GIRepository 2.0 — вызов через dup_default().
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  # В Nix '' один ' пишется как ''
  patchScript = ''
    f="$out/bin/.ags-wrapped"
    [ -f "$f" ] || exit 0
    # Сохраняем путь между кавычками в \1
    sed -i 's|GIR\.Repository\.prepend_search_path(''\([^'']*\)'');|(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path(''\1'');|' "$f"
    sed -i 's|GIR\.Repository\.prepend_library_path(''\([^'']*\)'');|_r.prepend_library_path(''\1'');})();|' "$f"
  '';
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    postInstall = (old.postInstall or "") + patchScript;
  });
}
