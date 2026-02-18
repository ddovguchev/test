import GLib from "gi://GLib"

const SRC = (() => {
    const configDir = `${GLib.getenv("XDG_CONFIG_HOME") || GLib.get_home_dir() + "/.config"}/ags`
    try {
        const u = new URL("../..", import.meta.url)
        const path = u.pathname?.replace(/\/$/, "")
        if (path && path !== "/" && GLib.file_test(path + "/assets/icons", GLib.FileTest.EXISTS)) return path
    } catch {}
    return configDir
})()

export const APPS_ICON = `${SRC}/assets/icons/apps-svgrepo-com.svg`
export const NOTIFICATIONS_ICON = `${SRC}/assets/icons/notification-box-svgrepo-com.svg`

export const ICON_THEME_SEARCH_PATHS = [
    "/run/current-system/sw/share/icons",
    `/etc/profiles/per-user/${GLib.get_user_name()}/share/icons`,
    `${GLib.get_home_dir()}/.nix-profile/share/icons`,
    "/usr/local/share/icons",
    "/usr/share/icons",
]
