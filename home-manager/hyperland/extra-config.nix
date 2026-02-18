{ config, pkgs, lib, ... }:

{
  wayland.windowManager.hyprland.extraConfig = ''
    # Resize submap
    bind=$mod,R,exec,echo -n "Resize" > /tmp/hypr_submap
    bind=$mod,R,submap,resize

    submap=resize

    binde=,l,resizeactive,30 0
    binde=,h,resizeactive,-30 0
    binde=,k,resizeactive,0 -30
    binde=,j,resizeactive,0 30

    bind=,escape,exec,truncate -s 0 /tmp/hypr_submap
    bind=,escape,submap,reset

    submap=reset

    # Launch submap
    bind=$mod,A,exec,echo -n "Launch" > /tmp/hypr_submap
    bind=$mod,A,submap,launch

    submap=launch
    bind=,F,exec,firefox
    bind=,D,exec,neovide --no-vsync

    bind=,escape,exec,truncate -s 0 /tmp/hypr_submap
    bind=,escape,submap,reset

    bind=,F,exec,truncate -s 0 /tmp/hypr_submap
    bind=,F,submap,reset
    bind=,D,exec,truncate -s 0 /tmp/hypr_submap
    bind=,D,submap,reset

    submap=reset

    # Dynamic cursors plugin
    plugin {
        dynamic-cursors {
            enabled = true
            mode = stretch
            threshhold = 1
            stretch {
                limit = 1500
                function = linear
            }
            shake {
                enabled = true
                nearest = true
                threshold = 5.0
                base = 4.0
                speed = 5.0
                influence = 0.0
                limit = 0.0
                timeout = 2000
                effects = false
                ipc = false
            }
        }
    }
  '';
}



