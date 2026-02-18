import type { Gdk } from "ags/gtk3"

export function getModeSize(gdkmonitor: Gdk.Monitor, mode: string) {
    const geometry = (gdkmonitor as any)?.get_geometry?.()
    const monitorWidth = geometry?.width ?? 2560
    const horizontalInset = 20
    const fullWidth = Math.max(600, monitorWidth - horizontalInset)
    if (mode === "apps") return { width: Math.round(monitorWidth * 0.6), height: 400 }
    if (mode === "wallpaper") return { width: Math.max(1320, Math.round(monitorWidth * 0.5)), height: 280 }
    if (mode === "workspaces") return { width: Math.max(1320, Math.round(monitorWidth * 0.56)), height: 300 }
    if (mode === "session") return { width: Math.round(monitorWidth * 0.36), height: 190 }
    if (mode === "notifications") return { width: Math.round(monitorWidth * 0.3), height: 180 }
    return { width: fullWidth, height: 36 }
}
