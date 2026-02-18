import { panelMode } from "./launcherState"

export function setupVisibleWhenNone(self: any) {
    self.visible = panelMode() === "none"
    panelMode.subscribe((mode: string) => {
        self.visible = mode === "none"
    })
}

export function setupVisibleWhenMode(self: any, targetMode: string) {
    self.visible = panelMode() === targetMode
    panelMode.subscribe((mode: string) => {
        self.visible = mode === targetMode
    })
}

export function setupVisibleWhenPanelOpen(self: any) {
    self.visible = panelMode() !== "none"
    panelMode.subscribe((mode: string) => {
        self.visible = mode !== "none"
    })
}
