import GLib from "gi://GLib"
import { Gtk } from "astal/gtk3"
import { togglePanelMode } from "../../../launcherState"

function getWorkspaceDotsLabel() {
    const runJsonCommand = (command: string) => {
        try {
            const [ok, stdout] = GLib.spawn_command_line_sync(`sh -lc '${command}'`)
            if (!ok || !stdout) return null
            const text = new TextDecoder().decode(stdout as Uint8Array).trim()
            if (!text) return null
            return JSON.parse(text)
        } catch {
            return null
        }
    }
    const workspacesRaw = runJsonCommand("hyprctl -j workspaces")
    const activeRaw = runJsonCommand("hyprctl -j activeworkspace")
    const workspaces = Array.isArray(workspacesRaw) ? workspacesRaw : []
    const activeId = Number(activeRaw?.id ?? -1)
    const ids = new Set<number>()
    workspaces.forEach((ws: { id?: number }) => {
        const id = Number(ws?.id ?? -1)
        if (id > 0) ids.add(id)
    })
    if (activeId > 0) ids.add(activeId)
    const maxId = Math.max(1, ...Array.from(ids))
    return Array.from({ length: maxId }, (_, i) => (i + 1 === activeId ? "●" : "•")).join(" ")
}

export function WorkspacesButton() {
    return (
        <button
            className="workspaces-button"
            onClicked={() => togglePanelMode("workspaces")}
            setup={(self: Gtk.Button) => {
                const refresh = () => {
                    self.set_label?.(getWorkspaceDotsLabel())
                    if (!self.set_label) (self as { label?: string }).label = getWorkspaceDotsLabel()
                }
                refresh()
                const timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1200, () => {
                    refresh()
                    return true
                })
                self.connect?.("destroy", () => {
                    if (timerId) GLib.source_remove(timerId)
                })
            }}
            halign={Gtk.Align.CENTER}
        />
    )
}
