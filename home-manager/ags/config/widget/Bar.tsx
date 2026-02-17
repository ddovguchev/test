import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { Variable } from "astal"
import GLib from "gi://GLib"
import GdkPixbuf from "gi://GdkPixbuf"
import Gio from "gi://Gio"
import type { AppInfo } from "gi://Gio"
import { closePanel, panelMode, togglePanelMode } from "./launcherState"

const appsIcon = `${SRC}/assets/apps-svgrepo-com.svg`
const notificationsIcon = `${SRC}/assets/notification-box-svgrepo-com.svg`
const time = Variable("").poll(1000, "date +'%I:%M %p'")
const apps = Gio.AppInfo
    .get_all()
    .filter((app) => app.should_show())
    .map((app) => ({
        app,
        name: app.get_display_name() ?? app.get_name() ?? "Application"
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    const getModeSize = (mode: string) => {
        const geometry = (gdkmonitor as any)?.get_geometry?.()
        const monitorWidth = geometry?.width ?? 2560
        const horizontalInset = 24
        const fullWidth = Math.max(600, monitorWidth - horizontalInset)
        if (mode === "apps") {
            return { width: Math.round(monitorWidth * 0.6), height: 400 }
        }
        if (mode === "wallpaper") {
            return { width: Math.round(monitorWidth * 0.4), height: 700 }
        }
        if (mode === "notifications") {
            return { width: Math.round(monitorWidth * 0.3), height: 180 }
        }
        return { width: fullWidth, height: 36 }
    }

    return <window
        name="bar"
        namespace="bar"
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        keymode={Astal.Keymode.ON_DEMAND}
        onKeyPressEvent={(_: any, event: any) => {
            const keyval = event?.get_keyval?.()[1] ?? event?.keyval
            if (keyval === 65307) {
                closePanel()
                return true
            }
            return false
        }}
        onFocusOutEvent={() => {
            if (panelMode() !== "none") {
                closePanel()
            }
            return false
        }}
        application={App}>
        <box
            className="shell-panel mode-none"
            setup={(self: any) => {
                const initial = getModeSize(panelMode())
                let currentWidth = initial.width
                let currentHeight = initial.height
                let animationId = 0

                self.set_size_request(initial.width, initial.height)
                panelMode.subscribe((mode: string) => {
                    self.className = `shell-panel mode-${mode}`
                    const target = getModeSize(mode)
                    if (animationId !== 0) {
                        GLib.source_remove(animationId)
                    }
                    animationId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
                        currentWidth += (target.width - currentWidth) * 0.22
                        currentHeight += (target.height - currentHeight) * 0.22

                        const widthDone = Math.abs(target.width - currentWidth) < 1
                        const heightDone = Math.abs(target.height - currentHeight) < 1

                        if (widthDone && heightDone) {
                            currentWidth = target.width
                            currentHeight = target.height
                            self.set_size_request(target.width, target.height)
                            animationId = 0
                            return false
                        }

                        self.set_size_request(Math.round(currentWidth), Math.round(currentHeight))
                        return true
                    })
                })
            }}
            halign={Gtk.Align.CENTER}
            vertical
        >
            <centerbox
                className="shell-top-row"
                setup={(self: any) => {
                    self.visible = panelMode() === "none"
                    panelMode.subscribe((mode: string) => {
                        self.visible = mode === "none"
                    })
                }}
            >
                <box>
                    <label
                        className="clock-label"
                        label={time()}
                        setup={(self: any) => {
                            self.visible = panelMode() === "none"
                            panelMode.subscribe((mode: string) => {
                                self.visible = mode === "none"
                            })
                        }}
                    />
                    <button
                        className="apps-button"
                        onClicked={() => togglePanelMode("apps")}
                        setup={(self: any) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                                appsIcon,
                                14,
                                14,
                                true
                            )
                            const icon = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label("")
                        }}
                        halign={Gtk.Align.CENTER}
                    />
                    <button
                        onClicked={() => togglePanelMode("wallpaper")}
                        halign={Gtk.Align.CENTER}
                    >
                        Wallpapers
                    </button>
                </box>
                <box />
                <box>
                    <button
                        className="notifications-button"
                        onClicked={() => togglePanelMode("notifications")}
                        setup={(self: any) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                                notificationsIcon,
                                14,
                                14,
                                true
                            )
                            const icon = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label("")
                        }}
                        halign={Gtk.Align.CENTER}
                    />
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
                    <entry
                        className="apps-input"
                        placeholderText="Search app..."
                    />
                    <scrolledwindow className="apps-menu-scroll" vexpand>
                        <box className="apps-menu-list" vertical>
                            {apps.map((entry) => (
                                <button
                                    className="apps-menu-item"
                                    onClicked={() => {
                                        (entry.app as AppInfo).launch([], null)
                                        closePanel()
                                    }}
                                >
                                    <label label={entry.name} />
                                </button>
                            ))}
                        </box>
                    </scrolledwindow>
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
                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "wallpaper"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "wallpaper"
                        })
                    }}
                    vertical
                >
                    <label className="wallpaper-title" label="Select wallpaper" />
                    <box className="wallpaper-block" vertical>
                        <label label="Wallpaper grid placeholder" />
                    </box>
                </box>
            </box>
        </box>
    </window>
}
