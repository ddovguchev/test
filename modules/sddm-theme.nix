# If SDDM still freezes, set useDefaultTheme = true to switch to chili theme
{ lib, pkgs, ... }:
let
  useDefaultTheme = false;
  themeName = if useDefaultTheme then "chili" else "silent";
  themeDir = "/share/sddm/themes/silent";
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

      cp "$src/configs/minimal.conf" "$base/configs/minimal.conf"
      cp "$src/configs/rei.conf" "$base/configs/rei.conf"
      cp "$src/configs/silvia.conf" "$base/configs/silvia.conf"

      # Copy backgrounds only if they exist (optional - minimal.conf uses solid colors)
      for f in rei.png silvia.png rei.mp4 silvia.mp4; do
        [ -f "$src/backgrounds/$f" ] && cp "$src/backgrounds/$f" "$base/backgrounds/"
      done

      substituteInPlace "$base/metadata.desktop" \
        --replace-warn "ConfigFile=configs/default.conf" "ConfigFile=configs/minimal.conf"

      runHook postInstall
    '';
  };
  sddmConfig = if useDefaultTheme then {
    enable = true;
    package = lib.mkDefault pkgs.kdePackages.sddm;
    wayland.enable = true;
    theme = themeName;
  } else {
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
        # InputMethod removed - qtvirtualkeyboard can cause SDDM to freeze
        GreeterEnvironment = "QML2_IMPORT_PATH=${silentTheme}${themeDir}/components/";
      };
    };
  };
in
{
  environment.systemPackages = lib.mkIf (!useDefaultTheme) [ silentTheme ];

  services.displayManager.sddm = sddmConfig;
}
