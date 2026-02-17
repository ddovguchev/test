import { App, Astal } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { closePanel, panelMode } from "./launcherState"

export default function InteractionBackdrop(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        name="bar-backdrop"
        namespace="bar-backdrop"
        className="InteractionBackdrop"
        gdkmonitor={gdkmonitor}
        anchor={TOP | BOTTOM | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        setup={(self: any) => {
            self.visible = false
            panelMode.subscribe((mode: string) => {
                self.visible = mode !== "none"
            })
        }}
        application={App}>
        <eventbox
            className="backdrop-hitbox"
            onButtonPressEvent={() => {
                closePanel()
                return true
            }}>
            <box className="backdrop-fill" hexpand vexpand />
        </eventbox>
    </window>
}
