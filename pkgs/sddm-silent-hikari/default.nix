# SilentSDDM (vendored QML), только theme1 (rei) + theme2 (silvia), фоны — jpg из home/images/walls.
{ lib, stdenvNoCC, kdePackages, themeVariant ? "theme1" }:
let
  variant =
    if builtins.elem themeVariant [ "theme1" "theme2" ] then themeVariant else "theme1";
  bg1 = builtins.path {
    path = ../../home/images/walls/ghost.jpg;
    name = "theme1-bg-src.jpg";
  };
  bg2 = builtins.path {
    path = ../../home/images/walls/vixima.jpg;
    name = "theme2-bg-src.jpg";
  };
in
stdenvNoCC.mkDerivation {
  pname = "hikari-silent-sddm";
  version = "1.4.0";

  src = ./vendor;

  propagatedBuildInputs = builtins.attrValues {
    inherit (kdePackages) qtmultimedia qtsvg qtvirtualkeyboard;
  };

  dontWrapQtApps = true;

  installPhase = ''
    theme="$out/share/sddm/themes/hikari-silent"
    mkdir -p "$theme"
    cp -r $src/* "$theme/"

    mkdir -p "$theme/configs"
    cp ${./configs/theme1.conf} "$theme/configs/theme1.conf"
    cp ${./configs/theme2.conf} "$theme/configs/theme2.conf"

    mkdir -p "$theme/backgrounds"
    cp ${bg1} "$theme/backgrounds/theme1-bg.jpg"
    cp ${bg2} "$theme/backgrounds/theme2-bg.jpg"

    substituteInPlace "$theme/metadata.desktop" \
      --replace-fail 'ConfigFile=configs/default.conf' 'ConfigFile=configs/${variant}.conf' \
      --replace-fail 'Name=Silent' 'Name=Hikari Silent' \
      --replace-fail 'Theme-Id=silent' 'Theme-Id=hikari-silent'

    substituteInPlace "$theme/metadata.desktop" \
      --replace-fail 'Screenshot=docs/previews/default.png' 'Screenshot=backgrounds/${variant}-bg.jpg'
  '';

  meta = with lib; {
    description = "SDDM SilentSDDM theme (Hikari: theme1/theme2)";
    license = licenses.gpl3Only;
  };
}
