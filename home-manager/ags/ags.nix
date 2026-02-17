{ config, pkgs, lib, ... }:
let
  cfg = ./config;
  astal = with pkgs; [ astal.astal3 astal.io astal.wireplumber astal.notifd ];
  typelib = lib.makeSearchPath "lib/girepository-1.0" astal;
  schema = lib.makeSearchPath "share/glib-2.0/schemas" astal;
  data = lib.makeSearchPath "share" astal;
  astalGjs = "${pkgs.astal.gjs}/share/astal/gjs";
  wrapped = pkgs.runCommand "ags-wrapped" { buildInputs = [ pkgs.makeWrapper ]; } ''
    mkdir -p $out/bin
    makeWrapper ${pkgs.ags}/bin/ags $out/bin/ags \
      --set GI_TYPELIB_PATH "${typelib}" \
      --set GSETTINGS_SCHEMA_DIR "${schema}" \
      --prefix XDG_DATA_DIRS : "${data}"
  '';
  bin = "${wrapped}/bin/ags";
  agsSh = pkgs.writeShellScript "ags" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${data}:''${XDG_DATA_DIRS:-}"
    if [ "''${1:-}" = "run" ]; then shift; exec "${bin}" run "$@"; else exec "${bin}" "$@"; fi
  '';
  agsRunSh = pkgs.writeShellScript "ags-run" ''
    export GI_TYPELIB_PATH="${typelib}"
    export GSETTINGS_SCHEMA_DIR="${schema}:''${GSETTINGS_SCHEMA_DIR:-}"
    export XDG_DATA_DIRS="${data}:''${XDG_DATA_DIRS:-}"
    cd "''${AGS_CONFIG:-$HOME/.config/ags}" && exec "${bin}" run "$@"
  '';
  agsScripts = pkgs.runCommand "ags-scripts" {} ''
    mkdir -p $out/bin
    cp ${agsSh} $out/bin/ags
    cp ${agsRunSh} $out/bin/ags-run
    chmod +x $out/bin/ags $out/bin/ags-run
  '';
in
{
  xdg.configFile."ags/app.ts".source = "${cfg}/app.ts";
  xdg.configFile."ags/style.scss".source = "${cfg}/style.scss";
  xdg.configFile."ags/tsconfig.json".source = "${cfg}/tsconfig.json";
  xdg.configFile."ags/env.d.ts".source = "${cfg}/env.d.ts";
  xdg.configFile."ags/.gitignore".source = "${cfg}/.gitignore";
  xdg.configFile."ags/widget/Bar.tsx".source = "${cfg}/widget/Bar.tsx";
  xdg.configFile."ags/package.json".text = builtins.toJSON {
    name = "astal-shell";
    dependencies = { astal = astalGjs; };
  };
  xdg.configFile."ags/node_modules/astal".source = astalGjs;
  home.packages = [ agsScripts ];
  home.sessionVariables = {
    GI_TYPELIB_PATH = typelib;
    GSETTINGS_SCHEMA_DIR = schema;
    XDG_DATA_DIRS = data;
  };
}
