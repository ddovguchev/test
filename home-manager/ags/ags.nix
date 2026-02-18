# AGS bar - uses official home-manager module
{ config, pkgs, lib, inputs, ... }:
let
  cfg = ./config;
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
    mkdir -p $out/widget $out/assets
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
in
{
  programs.ags = {
    enable = true;
    configDir = agsConfig;
    extraPackages = with pkgs.astal; [ wireplumber notifd ];
    systemd.enable = true;
  };

  # Override AGS service: --gtk 3, run from config dir, wait for Hyprland
  systemd.user.services.ags = {
    Unit.After = lib.mkForce [ "graphical-session.target" "hyprland-session.target" ];
    Service = {
      ExecStart = lib.mkForce "${config.programs.ags.finalPackage}/bin/ags run --gtk 3";
      WorkingDirectory = lib.mkForce "%h/.config/ags";
    };
  };
}
