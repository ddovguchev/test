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
    hash = "sha256-+OXRqnlVeCP2Ihco+J7s5BQPpwFyRRf8lnVsN7rm+Cc=";
  })
  (pkgs.fetchpatch {
    name = "dwm-scratchpad-20240321.patch";
    url = "https://dwm.suckless.org/patches/scratchpad/dwm-scratchpad-20240321-061e9fe.diff";
    hash = "sha256-ObLLp46y8Ig65tKZVwWUpsqctdc9t8sDQJOhYtcM0ww=";
  })
]
