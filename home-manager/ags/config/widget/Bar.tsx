import app from "ags/gtk3/app"
import { Astal, Gtk } from "ags/gtk3"
import type { Gdk } from "ags/gtk3"
import { createPoll } from "ags/time"

const clock = createPoll("", 1000, "date +'%H:%M'")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    return (
        <window
            name="bar"
            class="Bar"
            gdkmonitor={gdkmonitor}
            anchor={TOP | LEFT | RIGHT}
            application={app}
        >
            <box class="shell-panel">
                <label label={clock()} $={(self: any) => clock.subscribe((v: string) => self.set_label?.(v))} />
            </box>
        </window>
    )
}
