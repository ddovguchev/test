# AGS bar - полная настройка для запуска
{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
  system = pkgs.stdenv.hostPlatform.system;
  astalJs = inputs.ags.packages.${system}.default.jsPackage;
  palette = import ../theme/palette.nix;
  styleScss = builtins.replaceStrings
    [
      "__FG_COLOR__"
      "__BAR_BG__"
      "__BAR_BORDER__"
      "__BAR_SHADOW__"
      "__PANEL_BG__"
      "__PANEL_TEXT__"
      "__PANEL_BORDER__"
    ]
    [
      palette.ags.barFg
      palette.ags.barBgOpacity
      palette.ags.barBorder
      palette.ags.barShadow
      palette.ags.panelBg
      palette.ags.launcherText
      palette.ags.panelBorder
    ]
    (builtins.readFile "${cfg}/style.scss");
  agsConfig = pkgs.runCommand "ags-config" { } ''
        mkdir -p $out/widget $out/assets $out/node_modules
        ln -s ${astalJs} $out/node_modules/astal
        ln -s ${astalJs} $out/node_modules/ags
        cp ${cfg}/app.ts $out/app.ts
        cp ${cfg}/tsconfig.json $out/tsconfig.json
        cp ${cfg}/env.d.ts $out/env.d.ts
        cp ${cfg}/.gitignore $out/.gitignore 2>/dev/null || true
        cp -r ${cfg}/assets/. $out/assets/
        cp ${cfg}/widget/Bar.tsx $out/widget/Bar.tsx
        cp ${cfg}/widget/Launcher.tsx $out/widget/Launcher.tsx
        cp ${cfg}/widget/launcherState.ts $out/widget/launcherState.ts

        cat > $out/style.scss <<'EOF'
    ${styleScss}
    EOF

        cat > $out/package.json <<'EOF'
    {
      "name": "astal-shell",
      "private": true,
      "type": "module",
      "dependencies": {
        "astal": "file:~/.local/share/ags"
      }
    }
    EOF
  '';
  agsBin = config.programs.ags.finalPackage;
  # Скрипт запуска: ждёт Wayland и конфиг, затем запускает ags
  agsStartScript = pkgs.writeScriptBin "ags-start" ''
    export XDG_CONFIG_HOME="''${XDG_CONFIG_HOME:-$HOME/.config}"
    export XDG_RUNTIME_DIR="''${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
    CONFIG_DIR="$XDG_CONFIG_HOME/ags"

    # Ждём Wayland (макс 10 сек)
    for _ in $(seq 1 50); do
      [ -n "''${WAYLAND_DISPLAY:-}" ] && break
      sleep 0.2
    done

    # Ждём появления конфига (макс 10 сек)
    for _ in $(seq 1 25); do
      [ -f "$CONFIG_DIR/app.ts" ] && break
      sleep 0.4
    done

    if [ ! -f "$CONFIG_DIR/app.ts" ]; then
      echo "AGS: config not found at $CONFIG_DIR" >&2
      exit 1
    fi

    cd "$CONFIG_DIR" && exec ${agsBin}/bin/ags run --gtk 3 "$@"
  '';
in
{
  programs.ags = {
    enable = true;
    configDir = agsConfig;
    extraPackages = with pkgs.astal; [ wireplumber notifd ];
    systemd.enable = false;  # баг модуля: "expected ']' but got '"'" в unit
  };

  home.packages = [ agsStartScript ];

  # Свой systemd service вместо сломанного в модуле AGS
  systemd.user.services.ags = {
    Unit = {
      Description = "AGS bar";
      PartOf = [ "graphical-session.target" ];
      After = [ "graphical-session-pre.target" ];
    };
    Service = {
      ExecStart = "${agsStartScript}/bin/ags-start";
      Restart = "on-failure";
      RestartSec = 2;
      KillMode = "mixed";
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
  };
}
