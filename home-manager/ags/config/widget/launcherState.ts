import { createState } from "ags"

export type PanelMode = "none" | "apps" | "notifications" | "wallpaper" | "session"

const [panelModeAccessor, setPanelModeState] = createState<PanelMode>("none")
const [launcherQueryAccessor, setLauncherQueryState] = createState("")
const [launcherVisibleAccessor, setLauncherVisibleState] = createState(false)

panelModeAccessor.subscribe(() => {
    setLauncherVisibleState(panelModeAccessor() === "apps")
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

export function setLauncherQuery(value: string) {
    setLauncherQueryState(value)
}

export const toggleLauncher = () => togglePanelMode("apps")
export const closeLauncher = closePanel
