# Профили сессий: переменные из /etc задаёт greetd; niri см. conf/ui/niri.
{ lib, pkgs, profiles ? { }, ... }:
{
  home.packages = [
    pkgs.fuzzel
    (pkgs.writeShellScriptBin "hikari-terminal" ''
      if [ -n "$TERMINAL" ]; then exec "$TERMINAL" "$@"; fi
      exec ${lib.getExe pkgs.wezterm} "$@"
    '')
    (pkgs.writeShellScriptBin "hikari-browser" ''
      if [ -n "$BROWSER" ]; then exec "$BROWSER" "$@"; fi
      exec ${lib.getExe pkgs.firefox} "$@"
    '')
  ];

  home.file.".config/hikari/README.md".text =
    let
      lines = lib.mapAttrsToList (id: p: "- **${id}**: ${p.label}") profiles;
    in
    ''
      # Профили Hikari

      Редактируй `profiles/default.nix` в репозитории флейка (терминал, браузер, wayland/x11, locale).

      При входе tuigreet задаёт `HIKARI_PROFILE`, `TERMINAL`, `BROWSER`, `LANG` из `/etc/hikari/profiles/<id>.env`.

      В niri: Mod+Return — hikari-terminal, Mod+D — fuzzel.

      ${lib.concatStringsSep "\n" lines}
    '';
}
