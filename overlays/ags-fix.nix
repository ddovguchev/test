# Fix AGS v1 (ags_1) on NixOS 25.11: GIRepository 2.0 — вызов через dup_default().
final: prev:
let
  ags = prev.ags_1 or prev.ags;
  # Патчим без regex, подставляя путь $out/lib (так подставляет meson в .in)
  q = "\"";
  patchScript = ''
    f="$out/bin/.ags-wrapped"
    lib="$out/lib"
    if [ -f "$f" ]; then
      substituteInPlace "$f" \
        --replace ${q}GIR.Repository.prepend_search_path(''$lib'');${q} \
        ${q}(function(){const _r=GIR.Repository.dup_default();_r.prepend_search_path(''$lib'');${q}
      substituteInPlace "$f" \
        --replace ${q}GIR.Repository.prepend_library_path(''$lib'');${q} \
        ${q}_r.prepend_library_path(''$lib'');})();${q}
    fi
  '';
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.buildPackages.patch ];
    postInstall = (old.postInstall or "") + patchScript;
  });
}
