import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { Variable } from "astal"
import { closePanel, panelMode, togglePanelMode } from "./launcherState"

const time = Variable("").poll(1000, "date")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    const updateShellClass = (self: any, mode: string) => {
        self.className = `shell-panel mode-${mode}`
    }

    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <box
            setup={(self: any) => {
                updateShellClass(self, panelMode())
                panelMode.subscribe((mode: string) => updateShellClass(self, mode))
            }}
            halign={Gtk.Align.CENTER}
            vertical
        >
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
                    onClicked={closePanel}
                    halign={Gtk.Align.CENTER}
                >
                    Close
                </button>
                <button
                    onClicked={() => console.log("hello")}
                    halign={Gtk.Align.CENTER}
                >
                    <label label={time()} />
                </button>
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
                <label
                    setup={(self: any) => {
                        self.label = "Applications panel"
                        panelMode.subscribe((mode: string) => {
                            self.label = mode === "notifications"
                                ? "Notifications panel"
                                : "Applications panel"
                        })
                    }}
                />
            </box>
        </box>
    </window>
}
