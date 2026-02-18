import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { closePanel, panelMode } from "./launcherState"

export default function PanelOverlay(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="PanelOverlay mode-none"
        gdkmonitor={gdkmonitor}
        anchor={TOP | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        setup={(self: any) => {
            self.visible = false
            panelMode.subscribe((mode: string) => {
                self.className = `PanelOverlay mode-${mode}`
                self.visible = mode !== "none"
            })
        }}
        application={App}>
        <box className="panel-root" halign={Gtk.Align.CENTER} vertical>
            <box className="panel-header">
                <label label="Panel" />
                <button onClicked={closePanel}>Close</button>
            </box>
            <box className="panel-content" vertical>
                <label label="Content" />
            </box>
        </box>
    </window>
}
