import GLib from "gi://GLib"

export const APPS_ICON = `${SRC}/assets/icons/apps-svgrepo-com.svg`
export const NOTIFICATIONS_ICON = `${SRC}/assets/icons/notification-box-svgrepo-com.svg`

export const ICON_THEME_SEARCH_PATHS = [
    "/run/current-system/sw/share/icons",
    `/etc/profiles/per-user/${GLib.get_user_name()}/share/icons`,
    `${GLib.get_home_dir()}/.nix-profile/share/icons`,
    "/usr/local/share/icons",
    "/usr/share/icons",
]
