# Minimal niri config — spawn через hikari-terminal / hikari-browser (см. профили).
{ ... }:
''
  environment {
    QT_QPA_PLATFORM "wayland"
    XDG_CURRENT_DESKTOP "niri"
  }

  layout {
    gaps 12
    focus-ring {
      width 4
      active-color "#5a8ca8"
      inactive-color "#50505080"
    }
  }

  input {
    keyboard {
      xkb {
        layout "us"
      }
    }
    touchpad {
      tap
      natural-scroll
    }
  }

  binds {
    Mod+Shift+Slash { show-hotkey-overlay; }
    Mod+Return { spawn "hikari-terminal"; }
    Mod+D { spawn "fuzzel"; }
    Mod+Q { close-window; }
    Mod+Shift+E { quit; }
  }
''
