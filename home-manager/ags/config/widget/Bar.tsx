import { App, Astal, Gtk } from "astal/gtk3"
import type { Gdk } from "astal/gtk3"
import { Variable } from "astal"
import GLib from "gi://GLib"
import GdkPixbuf from "gi://GdkPixbuf"
import Gio from "gi://Gio"
import { closePanel, panelMode, togglePanelMode } from "./launcherState"

const appsIcon = `${SRC}/assets/apps-svgrepo-com.svg`
const notificationsIcon = `${SRC}/assets/notification-box-svgrepo-com.svg`
const time = Variable("").poll(1000, "date +'%I:%M %p'")

const apps = Gio.AppInfo
    .get_all()
    .filter((app: any) => app.should_show())
    .map((app: any) => ({
        app,
        name: app.get_display_name() ?? app.get_name() ?? "Application"
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

const supportedImageExt = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]

function listPictureFiles() {
    const picturesDir = `${GLib.get_home_dir()}/Pictures`
    const dir = Gio.File.new_for_path(picturesDir)
    const files: string[] = []

    try {
        const enumerator = dir.enumerate_children(
            "standard::name,standard::type",
            Gio.FileQueryInfoFlags.NONE,
            null
        )
        let info
        while ((info = enumerator.next_file(null)) !== null) {
            if (info.get_file_type() !== Gio.FileType.REGULAR) continue
            const name = info.get_name()
            const lower = name.toLowerCase()
            if (supportedImageExt.some((ext) => lower.endsWith(ext))) {
                files.push(`${picturesDir}/${name}`)
            }
        }
        enumerator.close(null)
    } catch {
        // ignore inaccessible Pictures directory
    }
    return files.sort()
}

function applyWallpaper(path: string) {
    const escaped = path.replaceAll("\"", "\\\"")
    GLib.spawn_command_line_async(`hyprctl hyprpaper preload "${escaped}"`)
    GLib.spawn_command_line_async(`hyprctl hyprpaper wallpaper "DP-4,${escaped}"`)
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    const getModeSize = (mode: string) => {
        const geometry = (gdkmonitor as any)?.get_geometry?.()
        const monitorWidth = geometry?.width ?? 2560
        const horizontalInset = 24
        const fullWidth = Math.max(600, monitorWidth - horizontalInset)
        if (mode === "apps") return { width: Math.round(monitorWidth * 0.6), height: 400 }
        if (mode === "wallpaper") return { width: Math.round(monitorWidth * 0.4), height: 700 }
        if (mode === "notifications") return { width: Math.round(monitorWidth * 0.3), height: 180 }
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
            if (panelMode() !== "none") closePanel()
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
                    if (animationId !== 0) GLib.source_remove(animationId)
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
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(appsIcon, 14, 14, true)
                            const icon = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label("")
                        }}
                        halign={Gtk.Align.CENTER}
                    />
                    <button onClicked={() => togglePanelMode("wallpaper")} halign={Gtk.Align.CENTER}>
                        Wallpapers
                    </button>
                </box>
                <box />
                <box>
                    <button
                        className="notifications-button"
                        onClicked={() => togglePanelMode("notifications")}
                        setup={(self: any) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(notificationsIcon, 14, 14, true)
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
                    <entry className="apps-input" placeholderText="Search app..." />
                    <box
                        className="apps-menu-scroll"
                        vexpand
                        setup={(self: any) => {
                            self.get_children?.().forEach((child: any) => self.remove(child))

                            const scroll = (Gtk as any).ScrolledWindow.new(null, null)
                            const hPolicy = (Gtk as any).PolicyType.NEVER ?? 2
                            const vPolicy = (Gtk as any).PolicyType.AUTOMATIC ?? 1
                            scroll.set_policy?.(hPolicy, vPolicy)
                            scroll.set_hexpand?.(true)
                            scroll.set_vexpand?.(true)

                            const container = (Gtk as any).Box.new((Gtk as any).Orientation.VERTICAL, 0)
                            container.get_style_context?.()?.add_class("apps-tiles-grid")

                            const grid = (Gtk as any).Grid.new()
                            grid.set_row_spacing(8)
                            grid.set_column_spacing(8)

                            apps.slice(0, 48).forEach((entry: any, index: number) => {
                                const button = (Gtk as any).Button.new()
                                button.get_style_context?.()?.add_class("apps-tile")

                                const content = (Gtk as any).Box.new((Gtk as any).Orientation.VERTICAL, 4)
                                const icon = entry.app.get_icon?.()
                                const image = icon
                                    ? (Gtk as any).Image.new_from_gicon(icon, (Gtk as any).IconSize.DIALOG)
                                    : (Gtk as any).Image.new_from_icon_name("application-x-executable", (Gtk as any).IconSize.DIALOG)
                                image.set_pixel_size?.(28)

                                const label = (Gtk as any).Label.new(entry.name)
                                label.set_max_width_chars?.(14)
                                label.set_ellipsize?.(3)

                                content.pack_start?.(image, false, false, 0)
                                content.pack_start?.(label, false, false, 0)
                                button.add(content)

                                button.connect("clicked", () => {
                                    entry.app.launch([], null)
                                    closePanel()
                                })

                                const col = index % 8
                                const row = Math.floor(index / 8)
                                grid.attach(button, col, row, 1, 1)
                            })

                            container.add(grid)
                            scroll.add(container)
                            self.add(scroll)
                            self.show_all?.()
                        }}
                    />
                </box>

                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "notifications"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "notifications"
                        })
                    }}
                    vertical
                />

                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "wallpaper"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "wallpaper"
                        })
                    }}
                    vertical
                >
                    <label className="wallpaper-title" label="Select wallpapers" />
                    <box
                        className="wallpaper-block"
                        setup={(self: any) => {
                            self.get_children?.().forEach((child: any) => self.remove(child))

                            const scroll = (Gtk as any).ScrolledWindow.new(null, null)
                            const hPolicy = (Gtk as any).PolicyType.AUTOMATIC ?? 1
                            const vPolicy = (Gtk as any).PolicyType.NEVER ?? 2
                            scroll.set_policy?.(hPolicy, vPolicy)
                            scroll.set_hexpand?.(true)
                            scroll.set_vexpand?.(true)

                            const row = (Gtk as any).Box.new((Gtk as any).Orientation.HORIZONTAL, 10)
                            listPictureFiles().forEach((path) => {
                                try {
                                    const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 220, 130, true)
                                    const image = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                                    const button = (Gtk as any).Button.new()
                                    button.get_style_context()?.add_class("wallpaper-tile")
                                    button.add(image)
                                    button.connect("clicked", () => {
                                        applyWallpaper(path)
                                        closePanel()
                                    })
                                    row.pack_start?.(button, false, false, 0)
                                } catch {
                                    // ignore invalid image files
                                }
                            })

                            scroll.add(row)
                            self.add(scroll)
                            self.show_all?.()
                        }}
                    />
                </box>
            </box>
        </box>
    </window>
}
