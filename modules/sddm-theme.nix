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
      cp "$src/backgrounds/rei.mp4" "$base/backgrounds/rei.mp4"
      cp "$src/backgrounds/silvia.mp4" "$base/backgrounds/silvia.mp4"

      # Keep the shipped default configuration aligned with our minimal set.
      substituteInPlace "$base/metadata.desktop" \
        --replace-warn "ConfigFile=configs/default.conf" "ConfigFile=configs/rei.conf"

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
      Wayland = {
        CompositorCommand = "${pkgs.weston}/bin/weston --shell=kiosk -c /etc/sddm/weston.ini";
      };
    };
  };

  environment.etc."sddm/weston.ini".text = ''
    [core]
    idle-time=0

    [output]
    name=DP-1
    mode=2560x1080@200
  '';
}
