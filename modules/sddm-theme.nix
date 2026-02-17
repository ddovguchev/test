{ lib, pkgs, ... }:
let
  themeName = "silent";
  themeDir = "/share/sddm/themes/${themeName}";
  src = ../sddm/SilentSDDM;

  silentTheme = pkgs.stdenvNoCC.mkDerivation {
    pname = "silent-sddm-minimal";
    version = "local";
    inherit src;

    installPhase = ''
      runHook preInstall

      base="$out${themeDir}"
      mkdir -p "$base"/{components,icons,backgrounds,configs}

      cp -r "$src/components/." "$base/components/"
      cp -r "$src/icons/." "$base/icons/"
      cp "$src/Main.qml" "$base/Main.qml"
      cp "$src/qmldir" "$base/qmldir"
      cp "$src/metadata.desktop" "$base/metadata.desktop"

      cp "$src/configs/rei.conf" "$base/configs/rei.conf"
      cp "$src/configs/silvia.conf" "$base/configs/silvia.conf"
      cp "$src/backgrounds/rei.png" "$base/backgrounds/rei.png"
      cp "$src/backgrounds/silvia.png" "$base/backgrounds/silvia.png"

      # Keep the shipped default configuration aligned with our minimal set.
      substituteInPlace "$base/metadata.desktop" \
        --replace-warn "ConfigFile=configs/default.conf" "ConfigFile=configs/rei.conf"

      # Avoid black screen issues from mp4 backgrounds in SDDM on NVIDIA.
      substituteInPlace "$base/configs/rei.conf" \
        --replace-warn "rei.mp4" "rei.png"
      substituteInPlace "$base/configs/silvia.conf" \
        --replace-warn "silvia.mp4" "silvia.png"

      runHook postInstall
    '';
  };
in
{
  environment.systemPackages = [ silentTheme ];

  services.displayManager.sddm = {
    enable = true;
    package = lib.mkDefault pkgs.kdePackages.sddm;
    wayland.enable = true;
    theme = themeName;
    extraPackages = with pkgs.kdePackages; [
      qtsvg
      qtmultimedia
      qtvirtualkeyboard
      qtwayland
      layer-shell-qt
    ];
    settings = {
      General = {
        InputMethod = "qtvirtualkeyboard";
        GreeterEnvironment = "QML2_IMPORT_PATH=${silentTheme}${themeDir}/components/,QT_IM_MODULE=qtvirtualkeyboard";
      };
    };
  };
}
