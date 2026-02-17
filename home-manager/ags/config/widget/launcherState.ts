import { Variable } from "astal"

export type PanelMode = "none" | "apps" | "notifications"

export const panelMode = Variable<PanelMode>("none")
export const launcherQuery = Variable("")
export const launcherVisible = Variable(false)

panelMode.subscribe((mode: PanelMode) => {
    launcherVisible.set(mode === "apps")
})

export function setPanelMode(mode: PanelMode) {
    panelMode.set(mode)
}

export function togglePanelMode(mode: PanelMode) {
    panelMode.set(panelMode() === mode ? "none" : mode)
}

export function closePanel() {
    panelMode.set("none")
    launcherQuery.set("")
}

export const toggleLauncher = () => togglePanelMode("apps")
export const closeLauncher = closePanel
