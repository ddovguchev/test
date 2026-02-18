import GLib from "gi://GLib"
import GdkPixbuf from "gi://GdkPixbuf"
import Gio from "gi://Gio"
import { Gtk } from "ags/gtk3"
import { ICON_THEME_SEARCH_PATHS } from "../shared/icons"

export type AppEntry = {
    app: any
    name: string
}

const APP_EXCLUDE_EXACT = new Set([
    "htop",
    "nixos manual",
    "volume control",
    "xterm",
    "ranger",
])

const APP_EXCLUDE_CONTAINS = ["helm", "nvim", "nvidia"]

let iconThemeInitialized = false

export function getApps(): AppEntry[] {
    return Gio.AppInfo
        .get_all()
        .filter((app: any) => app.should_show())
        .map((app: any) => ({
            app,
            name: app.get_display_name() ?? app.get_name() ?? "Application",
        }))
        .filter((entry: AppEntry) => {
            const name = String(entry.name).toLowerCase()
            const id = String(entry.app?.get_id?.() ?? "").toLowerCase()
            if (APP_EXCLUDE_EXACT.has(name)) return false
            return !APP_EXCLUDE_CONTAINS.some((pattern) => name.includes(pattern) || id.includes(pattern))
        })
        .sort((a: AppEntry, b: AppEntry) => a.name.localeCompare(b.name))
}

function getIconTheme() {
    const iconTheme = (Gtk as any).IconTheme.get_default?.()
    if (iconTheme && !iconThemeInitialized) {
        ICON_THEME_SEARCH_PATHS.forEach((path) => {
            iconTheme.append_search_path?.(path)
        })
        iconThemeInitialized = true
    }
    return iconTheme
}

function iconFromDesktopFile(app: any) {
    try {
        const id = app.get_id?.()
        if (!id) return null
        const envData = GLib.getenv("XDG_DATA_DIRS") ?? ""
        const bases = [
            "/run/current-system/sw/share",
            `/etc/profiles/per-user/${GLib.get_user_name()}/share`,
            `${GLib.get_home_dir()}/.nix-profile/share`,
            "/usr/local/share",
            "/usr/share",
            ...envData.split(":").filter(Boolean),
        ]
        const iconTheme = getIconTheme()
        for (const base of bases) {
            const desktopPath = `${base}/applications/${id}`
            if (!GLib.file_test(desktopPath, GLib.FileTest.EXISTS)) continue
            const key = new GLib.KeyFile()
            key.load_from_file(desktopPath, GLib.KeyFileFlags.NONE)
            const iconValue = key.get_string("Desktop Entry", "Icon")
            if (!iconValue) continue
            if (iconValue.startsWith("/") && GLib.file_test(iconValue, GLib.FileTest.EXISTS)) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(iconValue, 32, 32, true)
                return (Gtk as any).Image.new_from_pixbuf(pixbuf)
            }
            const pixbuf = iconTheme?.load_icon?.(iconValue, 32, 0)
            if (pixbuf) return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
    } catch {
        // fallback below
    }
    return null
}

export function createAppImage(app: any) {
    try {
        const icon = app.get_icon?.()
        const iconString = icon?.to_string?.() ?? ""
        if (iconString.startsWith("/")) {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(iconString, 32, 32, true)
            return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
        const iconTheme = getIconTheme()
        const names = icon?.get_names?.() ?? []
        const info = iconTheme?.choose_icon?.(names, 32, 0)
        const filename = info?.get_filename?.()
        if (filename) {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(filename, 32, 32, true)
            return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
        const appId = app.get_id?.()?.replace?.(".desktop", "")
        if (appId) return (Gtk as any).Image.new_from_icon_name(appId, (Gtk as any).IconSize.DIALOG)
        if (icon) return (Gtk as any).Image.new_from_gicon(icon, (Gtk as any).IconSize.DIALOG)
    } catch {
        // fallback below
    }
    const fromDesktop = iconFromDesktopFile(app)
    if (fromDesktop) return fromDesktop
    return (Gtk as any).Image.new_from_icon_name("application-x-executable", (Gtk as any).IconSize.DIALOG)
}
