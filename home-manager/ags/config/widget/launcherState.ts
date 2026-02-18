import { createState } from "ags"

export type PanelMode = "none" | "apps" | "notifications" | "wallpaper" | "workspaces" | "session"

const [panelModeAccessor, setPanelModeState] = createState<PanelMode>("none")
const [launcherQueryAccessor, setLauncherQueryState] = createState("")
const [launcherVisibleAccessor, setLauncherVisibleState] = createState(false)

panelModeAccessor.subscribe((mode: PanelMode) => {
    setLauncherVisibleState(mode === "apps")
})

export const panelMode = panelModeAccessor
export const launcherQuery = launcherQueryAccessor
export const launcherVisible = launcherVisibleAccessor

export function setPanelMode(mode: PanelMode) {
    setPanelModeState(mode)
}

export function togglePanelMode(mode: PanelMode) {
    setPanelModeState(panelMode() === mode ? "none" : mode)
}

export function closePanel() {
    setPanelModeState("none")
    setLauncherQueryState("")
}

export const toggleLauncher = () => togglePanelMode("apps")
export const closeLauncher = closePanel
