# Цвета niri из палитры темы (vixima и др.) — подключается в конце config.kdl через include.
{ colors }:
with colors;
''
  layout {
    focus-ring {
      active-color   "#${accent}"
      inactive-color "#${color0}"
      urgent-color   "#${color1}"
    }
    border {
      active-color   "#${accent}"
      inactive-color "#${color0}"
      urgent-color   "#${color1}"
    }
    shadow {
      color "#00000070"
    }
    tab-indicator {
      active-color   "#${accent}"
      inactive-color "#${color3}"
      urgent-color   "#${color1}"
    }
    insert-hint {
      color "#${accent}80"
    }
  }

  recent-windows {
    highlight {
      active-color "#${accent}"
      urgent-color "#${color1}"
    }
  }
''
