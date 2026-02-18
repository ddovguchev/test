import GLib from "gi://GLib"
import Gio from "gi://Gio"
import { closePanel } from "../launcherState"
import { runCommand } from "../shared/shell"

const SUPPORTED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]

export function listPictureFiles() {
    const scanDirs = [
        `${GLib.get_home_dir()}/Pictures`,
        `${GLib.get_home_dir()}/.config/ags/assets/wallpapers`,
    ]
    const files = new Set<string>()

    scanDirs.forEach((scanDir) => {
        try {
            const dir = Gio.File.new_for_path(scanDir)
            const enumerator = dir.enumerate_children(
                "standard::name,standard::type",
                Gio.FileQueryInfoFlags.NONE,
                null,
            )
            let info
            while ((info = enumerator.next_file(null)) !== null) {
                if (info.get_file_type() !== Gio.FileType.REGULAR) continue
                const name = info.get_name()
                const lower = name.toLowerCase()
                if (SUPPORTED_IMAGE_EXT.some((ext) => lower.endsWith(ext))) {
                    files.add(`${scanDir}/${name}`)
                }
            }
            enumerator.close(null)
        } catch {
            // ignore inaccessible directory
        }
    })

    return Array.from(files).sort()
}

export function applyWallpaper(path: string) {
    const escapedImage = path.replaceAll("\"", "\\\"")
    runCommand("sh -lc 'pgrep -x swww-daemon >/dev/null || swww-daemon'")
    runCommand(`swww img "${escapedImage}" --transition-type grow --transition-duration 1.0 --resize crop`)
    closePanel()
}
