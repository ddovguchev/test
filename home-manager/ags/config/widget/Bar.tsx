import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { Variable } from "astal"
import { closePanel, panelMode, togglePanelMode } from "./launcherState"

const time = Variable("").poll(1000, "date +'%I:%M %p'")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <box
            className="shell-panel mode-none"
            setup={(self: any) => {
                panelMode.subscribe((mode: string) => {
                    self.className = `shell-panel mode-${mode}`
                })
            }}
            halign={Gtk.Align.CENTER}
            vertical
        >
            <centerbox className="shell-top-row">
                <box>
                    <label className="clock-label" label={time()} />
                    <button
                        onClicked={() => togglePanelMode("apps")}
                        halign={Gtk.Align.CENTER}
                    >
                        Applications
                    </button>
                </box>
                <box />
                <box>
                    <button
                        onClicked={() => togglePanelMode("notifications")}
                        halign={Gtk.Align.CENTER}
                    >
                        Notifications
                    </button>
                    <button
                        onClicked={closePanel}
                        halign={Gtk.Align.CENTER}
                    >
                        <label label="Close" />
                    </button>
                </box>
            </centerbox>
            <box
                className="shell-content"
                setup={(self: any) => {
                    self.visible = panelMode() !== "none"
                    panelMode.subscribe((mode: string) => {
                        self.visible = mode !== "none"
                    })
                }}
                vertical
            >
                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "apps"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "apps"
                        })
                    }}
                    vertical
                >
                    <label label="Applications panel" />
                </box>
                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "notifications"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "notifications"
                        })
                    }}
                    vertical
                >
                    <label label="Notifications panel" />
                </box>
            </box>
        </box>
    </window>
}
