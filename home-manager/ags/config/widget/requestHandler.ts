import { closePanel, setPanelMode, togglePanelMode } from "./launcherState"
import type { PanelMode } from "./launcherState"

type RequestResult = "ok" | "unknown-request"

export function handleAppRequest(request: string): RequestResult {
    switch (request) {
        case "apps":
        case "notifications":
        case "wallpaper":
        case "workspaces":
        case "session":
            togglePanelMode(request as PanelMode)
            return "ok"
        case "close":
            closePanel()
            return "ok"
        case "none":
            setPanelMode("none")
            return "ok"
        default:
            return "unknown-request"
    }
}
