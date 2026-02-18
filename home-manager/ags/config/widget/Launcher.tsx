import app from "ags/gtk3/app"
import { Astal } from "ags/gtk3"
import type { Gdk } from "ags/gtk3"
import Gio from "gi://Gio"
import type { AppInfo } from "gi://Gio"
import { closeLauncher, launcherQuery, launcherVisible, setLauncherQuery } from "./launcherState"

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
        class="LauncherOverlay"
        gdkmonitor={gdkmonitor}
        anchor={TOP | BOTTOM | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        setup={(self: any) => {
            self.visible = false
            launcherVisible.subscribe(() => {
                self.visible = launcherVisible()
            })
        }}
        application={app}>
        <box class="launcher-backdrop" vertical>
            <button class="launcher-dismiss" onClicked={closeLauncher} />
            <box class="launcher-panel" vertical>
                <entry
                    class="launcher-search"
                    placeholderText="Search applications..."
                    text={launcherQuery()}
                    onChanged={(self: any) => setLauncherQuery(self.text)}
                />
                <scrolledwindow class="launcher-scroll" vexpand>
                    <flowbox class="launcher-grid">
                        {apps.map((entry: any) => (
                            <button class="app-tile" onClicked={() => launchApp(entry.app)}>
                                <label label={entry.name} />
                            </button>
                        ))}
                    </flowbox>
                </scrolledwindow>
            </box>
        </box>
    </window>
}
