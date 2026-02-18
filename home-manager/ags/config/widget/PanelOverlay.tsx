import app from "ags/gtk3/app"
import { Astal, Gtk } from "ags/gtk3"
import type { Gdk } from "ags/gtk3"
import { closePanel, panelMode } from "./launcherState"

export default function PanelOverlay(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        class="PanelOverlay mode-none"
        gdkmonitor={gdkmonitor}
        anchor={TOP | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        $={(self: any) => {
            self.visible = false
            panelMode.subscribe((mode: string) => {
                const ctx = self.get_style_context?.()
                if (ctx) {
                    ["mode-none", "mode-apps", "mode-wallpaper", "mode-session", "mode-notifications"].forEach((c) => ctx.remove_class(c))
                    ctx.add_class(`mode-${mode}`)
                }
                self.visible = mode !== "none"
            })
        }}
        application={app}>
        <box class="panel-root" halign={Gtk.Align.CENTER} vertical>
            <box class="panel-header">
                <label label="Panel" />
                <button onClicked={closePanel}>Close</button>
            </box>
            <box class="panel-content" vertical>
                <label label="Content" />
            </box>
        </box>
    </window>
}
