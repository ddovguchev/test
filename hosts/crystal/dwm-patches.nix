{ pkgs }:
[
  (pkgs.fetchpatch {
    name = "dwm-systray-6.6.patch";
    url = "https://dwm.suckless.org/patches/systray/dwm-systray-6.6.diff";
    hash = "sha256-VmRvELcsOSL0+9RTurNnDjPeKNOarCxUOci3cF/ZCwo=";
  })
  (pkgs.fetchpatch {
    name = "dwm-fullgaps-6.4.patch";
    url = "https://dwm.suckless.org/patches/fullgaps/dwm-fullgaps-6.4.diff";
    hash = "sha256-DvLNPOwDfaZj9o2n+t+xh6fj8X7EFW38ZWV5jzRhXxU=";
  })
  (pkgs.fetchpatch {
    name = "dwm-scratchpad-20240321.patch";
    url = "https://dwm.suckless.org/patches/scratchpad/dwm-scratchpad-20240321-061e9fe.diff";
    hash = "sha256-JTj06iZ/XjHzqONP2cE045yX+m12tpOqhVl4igdgxio=";
  })
]
