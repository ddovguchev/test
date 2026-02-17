import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { Variable } from "astal"
import { togglePanelMode } from "./launcherState"

const time = Variable("").poll(1000, "date")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <box className="shell-panel" halign={Gtk.Align.CENTER}>
            <centerbox className="shell-top-row">
                <button
                    onClicked={() => togglePanelMode("apps")}
                    halign={Gtk.Align.CENTER}
                >
                    Applications
                </button>
                <box />
                <button
                    onClicked={() => togglePanelMode("notifications")}
                    halign={Gtk.Align.CENTER}
                >
                    Notifications
                </button>
                <button
                    onClicked={() => console.log("hello")}
                    halign={Gtk.Align.CENTER}
                >
                    <label label={time()} />
                </button>
            </centerbox>
        </box>
    </window>
}
