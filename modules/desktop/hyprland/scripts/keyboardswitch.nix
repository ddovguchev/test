{ pkgs, ... }:
pkgs.writeShellScriptBin "keyboardswitch" ''
  hyprctl switchxkblayout all next
  json=$(hyprctl -j devices)
  idx=$(echo "$json" | ${pkgs.jq}/bin/jq -r '.keyboards[0].active_keymap // 0')
  layouts=$(echo "$json" | ${pkgs.jq}/bin/jq -r '.keyboards[0].layout // "us,ru"')
  name=$(echo "$layouts" | ${pkgs.coreutils}/bin/cut -d',' -f$((idx+1)) 2>/dev/null || echo "?")
  ${pkgs.libnotify}/bin/notify-send -a "Раскладка" -r 91190 -t 800 "''${name:-?}" 2>/dev/null || true
''
