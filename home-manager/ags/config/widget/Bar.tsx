import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { Variable } from "astal"
import Gio from "gi://Gio"

const time = Variable("").poll(1000, "date")
const launcherVisible = Variable(false)

const apps = Gio.AppInfo
    .get_all()
    .filter((app) => app.should_show())
    .map((app) => ({
        app,
        name: app.get_display_name() ?? app.get_name() ?? "Application",
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

function toggleLauncher() {
    launcherVisible.set(!launcherVisible())
}

function closeLauncher() {
    launcherVisible.set(false)
}

function launchApp(app: Gio.AppInfo) {
    app.launch([], null)
    closeLauncher()
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <centerbox>
            <button
                onClicked={toggleLauncher}
                halign={Gtk.Align.CENTER}
            >
                Applications
            </button>
            <box />
            <button
                onClicked={() => print("hello")}
                halign={Gtk.Align.CENTER}
            >
                <label label={time()} />
            </button>
        </centerbox>
    </window>
}

export function Launcher(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="LauncherOverlay"
        gdkmonitor={gdkmonitor}
        anchor={TOP | BOTTOM | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        visible={launcherVisible()}
        application={App}>
        <box className="launcher-backdrop" vertical>
            <box className="launcher-header">
                <button onClicked={closeLauncher}>Close</button>
            </box>
            <scrolledwindow className="launcher-scroll" vexpand>
                <flowbox className="launcher-grid">
                    {apps.map((entry) => (
                        <button className="app-tile" onClicked={() => launchApp(entry.app)}>
                            <label label={entry.name} />
                        </button>
                    ))}
                </flowbox>
            </scrolledwindow>
        </box>
    </window>
}
