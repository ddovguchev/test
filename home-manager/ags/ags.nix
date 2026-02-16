# AGS (Astal): конфиг + обёрнутый бинарь с typelibs и GSettings-схемами.
{ config, pkgs, lib, ... }:
let
  agsConfigDir = ./config;
  astalGjsPath = "${pkgs.astal.gjs}/share/astal/gjs";
  packageJsonFile = pkgs.writeText "ags-package.json" (builtins.toJSON {
    name = "astal-shell";
    dependencies = { astal = astalGjsPath; };
  });
  agsConfigWithDeps = pkgs.runCommand "ags-config" {
    nativeBuildInputs = [ pkgs.rsync ];
  } ''
    mkdir -p $out
    rsync -a --exclude='.git' --exclude='package.json' ${agsConfigDir}/ $out/
    cp ${packageJsonFile} $out/package.json
  '';
  astalPkgs = with pkgs; [
    astal.astal3
    astal.io
    astal.wireplumber
    astal.notifd
  ];
  typelibPath = lib.makeSearchPath "lib/girepository-1.0" astalPkgs;
  schemaPath = lib.makeSearchPath "share/glib-2.0/schemas" astalPkgs;
  dataDirs = lib.makeSearchPath "share" astalPkgs;
  # Обёрнутый ags: переменные заданы в бинаре, работает при любом вызове (ags run, ags init и т.д.)
  wrappedAgs = pkgs.runCommand "ags-wrapped" {
    buildInputs = [ pkgs.makeWrapper ];
  } ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.ags}/bin/ags $out/bin/ags \
      --set GI_TYPELIB_PATH "${typelibPath}" \
      --set GSETTINGS_SCHEMA_DIR "${schemaPath}" \
      --prefix XDG_DATA_DIRS : "${dataDirs}"
  '';
  # ags-run: перейти в ~/.config/ags и запустить обёрнутый ags run (для exec-once)
  agsRun = pkgs.writeShellScript "ags-run" ''
    cd "''${AGS_CONFIG:-$HOME/.config/ags}" && exec ${wrappedAgs}/bin/ags run "$@"
  '';
in
{
  xdg.configFile."ags".source = agsConfigWithDeps;

  home.sessionPath = [ "$HOME/.local/bin" ];

  home.file.".local/bin/ags-run" = {
    source = agsRun;
    executable = true;
  };

  # В PATH — обёрнутый ags, чтобы «ags run» в терминале тоже видел схемы
  home.file.".local/bin/ags" = {
    source = "${wrappedAgs}/bin/ags";
    executable = true;
  };

  home.sessionVariables = {
    GI_TYPELIB_PATH = typelibPath;
    GSETTINGS_SCHEMA_DIR = schemaPath;
    XDG_DATA_DIRS = dataDirs;
  };
}
