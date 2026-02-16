# Fix AGS v1 (ags_1) on NixOS 25.11: GIRepository 2.0 removed the singleton,
# so prepend_search_path must be called on the instance from dup_default().
final: prev:
let
  ags = prev.ags_1 or prev.ags;
in
prev.lib.optionalAttrs (prev ? ags_1 || prev ? ags) {
  ags_1 = ags.overrideAttrs (old: {
    postInstall = (old.postInstall or "") + ''
      wrapFile="$out/bin/.ags-wrapped"
      if [ -f "$wrapFile" ]; then
        # Line 1: use dup_default() and call on instance (GIRepository 2.0 API)
        sed -i "s|GIR.Repository.prepend_search_path('\\([^']*\\)');|(()=>{const _r=GIR.Repository.dup_default();_r.prepend_search_path('\\1');|" "$wrapFile"
        # Line 2
        sed -i "s|GIR.Repository.prepend_library_path('\\([^']*\\)');|_r.prepend_library_path('\\1');})();|" "$wrapFile"
      fi
    '';
  });
}
