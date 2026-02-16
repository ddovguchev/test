# AGS: конфиг из ./config, обёртка ags с typelibs и GSettings, --gtk 3 для run.
{ config, pkgs, lib, ... }:
let
  agsConfigDir = ./config;
  astalPkgs = with pkgs; [ astal.astal3 astal.io astal.wireplumber astal.notifd ];
  typelibPath = lib.makeSearchPath "lib/girepository-1.0" astalPkgs;
  schemaPath = lib.makeSearchPath "share/glib-2.0/schemas" astalPkgs;
  dataDirs = lib.makeSearchPath "share" astalPkgs;
  astalGjsPath = "${pkgs.astal.gjs}/share/astal/gjs";

  wrappedAgs = pkgs.runCommand "ags-wrapped" { buildInputs = [ pkgs.makeWrapper ]; } ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.ags}/bin/ags $out/bin/ags \
      --set GI_TYPELIB_PATH "${typelibPath}" \
      --set GSETTINGS_SCHEMA_DIR "${schemaPath}" \
      --prefix XDG_DATA_DIRS : "${dataDirs}"
  '';

  agsBin = "${wrappedAgs}/bin/ags";
  agsWrapper = pkgs.writeShellScript "ags" ''
    if [ "''${1:-}" = "run" ]; then shift; exec "${agsBin}" run "$@"; else exec "${agsBin}" "$@"; fi
  '';
  agsRun = pkgs.writeShellScript "ags-run" ''
    cd "''${AGS_CONFIG:-${config.home.homeDirectory}/.config/ags}" && exec "${agsBin}" run "$@"
  '';
in
{
  # Удалить старый ~/.config/ags если это симлинк в store (read-only), иначе home-manager не сможет записать файлы
  home.activation.removeOldAgsLink = lib.hm.dag.entryBefore [ "linkGeneration" ] ''
    if [ -L ${config.home.homeDirectory}/.config/ags ]; then
      rm -f ${config.home.homeDirectory}/.config/ags
    fi
  '';

  xdg.configFile."ags/app.ts".source = "${agsConfigDir}/app.ts";
  xdg.configFile."ags/style.scss".source = "${agsConfigDir}/style.scss";
  xdg.configFile."ags/tsconfig.json".source = "${agsConfigDir}/tsconfig.json";
  xdg.configFile."ags/env.d.ts".source = "${agsConfigDir}/env.d.ts";
  xdg.configFile."ags/.gitignore".source = "${agsConfigDir}/.gitignore";
  xdg.configFile."ags/widget/Bar.tsx".source = "${agsConfigDir}/widget/Bar.tsx";
  xdg.configFile."ags/package.json".text = builtins.toJSON {
    name = "astal-shell";
    dependencies = { astal = astalGjsPath; };
  };
  # Бандлер резолвит "astal/gtk3" из node_modules/astal — симлинк в store
  xdg.configFile."ags/node_modules/astal".source = astalGjsPath;

  home.sessionPath = [ "${config.home.homeDirectory}/.local/bin" ];
  home.file.".local/bin/ags" = { source = agsWrapper; executable = true; };
  home.file.".local/bin/ags-run" = { source = agsRun; executable = true; };

  home.sessionVariables = {
    GI_TYPELIB_PATH = typelibPath;
    GSETTINGS_SCHEMA_DIR = schemaPath;
    XDG_DATA_DIRS = dataDirs;
  };
}
