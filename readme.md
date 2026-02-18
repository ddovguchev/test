─> hikari in ~
└─> 󰮯 | hyprctl systeminfo
Hyprland 0.52.1 built from branch unknown at commit unknown unknown (unknown).
Date: unknown
Tag: unknown, commits: 0

Libraries:
Hyprgraphics: built against 0.4.0, system has unknown
Hyprutils: built against 0.10.2, system has unknown
Hyprcursor: built against 0.1.13, system has unknown
Hyprlang: built against 0.6.6, system has unknown
Aquamarine: built against 0.9.5, system has unknown

no flags were set


System Information:
System name: Linux
Node name: nixos
Release: 6.12.70
Version: #1-NixOS SMP PREEMPT_DYNAMIC Wed Feb 11 12:40:29 UTC 2026

Libraries:
Hyprgraphics: built against 0.4.0, system has unknown
Hyprutils: built against 0.10.2, system has unknown
Hyprcursor: built against 0.1.13, system has unknown
Hyprlang: built against 0.6.6, system has unknown
Aquamarine: built against 0.9.5, system has unknown



GPU information:
01:00.0 VGA compatible controller [0300]: NVIDIA Corporation GB206 [GeForce RTX 5060 Ti] [10de:2d04] (rev a1) (prog-if 00 [VGA controller])
10:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Raphael [1002:164e] (rev c5) (prog-if 00 [VGA controller])
NVRM version: NVIDIA UNIX Open Kernel Module for x86_64  580.119.02  Release Build  (nixbld@)


os-release: ANSI_COLOR="0;38;2;126;186;228"
BUG_REPORT_URL="https://github.com/NixOS/nixpkgs/issues"
BUILD_ID="25.11.20260214.3aadb7c"
CPE_NAME="cpe:/o:nixos:nixos:25.11"
DEFAULT_HOSTNAME=nixos
DOCUMENTATION_URL="https://nixos.org/learn.html"
HOME_URL="https://nixos.org/"
ID=nixos
ID_LIKE=""
IMAGE_ID=""
IMAGE_VERSION=""
LOGO="nix-snowflake"
NAME=NixOS
PRETTY_NAME="NixOS 25.11 (Xantusia)"
SUPPORT_END="2026-06-30"
SUPPORT_URL="https://nixos.org/community.html"
VARIANT=""
VARIANT_ID=""
VENDOR_NAME=NixOS
VENDOR_URL="https://nixos.org/"
VERSION="25.11 (Xantusia)"
VERSION_CODENAME=xantusia
VERSION_ID="25.11"


plugins:

Explicit sync: supported
GL ver: 3.2
Backend: drm

Monitor info:
Panel DP-4: 2560x1080, DP-4 Xiaomi Corporation Mi 30 HFCW 3410300023979 -> backend drm
explicit ✔️
edid:
hdr ❌
chroma ✔️
bt2020 ❌
vrr capable ❌
non-desktop ❌


Судя по всему, у тебя NVIDIA на Wayland через Hyprland. Подобные проблемы с «ghosting» могут быть связаны с несовершенством композитинга или конкретными драйверами. Попробуй обновить драйверы NVIDIA (убедись, что стоит пакет с Wayland фиксом), а также включи или отключи VSync через параметры Hyprland. Обрати внимание на настройки «damage tracking» и «max render time». В общем, «Wayland

“Напиши мне, пожалуйста, как это вбить в... Скажи мне промпт, чтобы, к примеру, редакторы кода поняли, что я хочу от них сделать.”

Попробуй так: «Как устранить ghosting/blur при прокрутке кода в IDE на Wayland (Hyprland) с high refresh rate монитором?» Или: «Как настроить композитинг/

“Не-не-не, вот то, что ты мне до этого объяснил, что проблемы с хостингом, быть связано с видеобезопасностью, пакет Vailant Fixam, вот, и так далее.”

Конечно, вот краткий промпт: «Как устранить ghosting при прокрутке кода на Hyprland (Wayland)? Использую NVIDIA, высокочастотный монитор. Есть ли фиксы в драйверах или настройках композитора, чтобы убрать размытие при быстром скролле?»
