import { App, Astal } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import Gio from "gi://Gio"
import type { AppInfo } from "gi://Gio"
import { closeLauncher, launcherQuery, launcherVisible } from "./launcherState"

const apps = Gio.AppInfo
    .get_all()
    .filter((app: any) => app.should_show())
    .map((app: any) => ({
        app,
        name: app.get_display_name() ?? app.get_name() ?? "Application"
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

function launchApp(app: AppInfo) {
    app.launch([], null)
    closeLauncher()
}

export default function Launcher(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="LauncherOverlay"
        gdkmonitor={gdkmonitor}
        anchor={TOP | BOTTOM | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        setup={(self: any) => {
            self.visible = false
            launcherVisible.subscribe((visible: boolean) => {
                self.visible = visible
            })
        }}
        application={App}>
        <box className="launcher-backdrop" vertical>
            <button className="launcher-dismiss" onClicked={closeLauncher} />
            <box className="launcher-panel" vertical>
                <entry
                    className="launcher-search"
                    placeholderText="Search applications..."
                    text={launcherQuery()}
                    onChanged={(self: any) => launcherQuery.set(self.text)}
                />
                <scrolledwindow className="launcher-scroll" vexpand>
                    <flowbox className="launcher-grid">
                        {apps.map((entry: any) => (
                            <button className="app-tile" onClicked={() => launchApp(entry.app)}>
                                <label label={entry.name} />
                            </button>
                        ))}
                    </flowbox>
                </scrolledwindow>
            </box>
        </box>
    </window>
}
