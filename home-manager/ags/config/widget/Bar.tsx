import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import GLib from "gi://GLib"
import GdkPixbuf from "gi://GdkPixbuf"
import Gio from "gi://Gio"
import { closePanel, panelMode } from "./launcherState"
import { Navbar } from "./bar/ui/Navbar"

function getApps() {
    return Gio.AppInfo
        .get_all()
        .filter((app: any) => app.should_show())
        .map((app: any) => ({
            app,
            name: app.get_display_name() ?? app.get_name() ?? "Application"
        }))
        .filter((entry: any) => {
            const name = String(entry.name).toLowerCase()
            const id = String(entry.app?.get_id?.() ?? "").toLowerCase()
            return ![
                "htop",
                "nixos manual",
                "volume control",
                "xterm",
                "ranger"
            ].includes(name)
                && !name.includes("helm")
                && !name.includes("nvim")
                && !name.includes("nvidia")
        })
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
}

const supportedImageExt = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
const iconThemeSearchPaths = [
    "/run/current-system/sw/share/icons",
    `/etc/profiles/per-user/${GLib.get_user_name()}/share/icons`,
    `${GLib.get_home_dir()}/.nix-profile/share/icons`,
    "/usr/local/share/icons",
    "/usr/share/icons"
]
let iconThemeInitialized = false

function listPictureFiles() {
    const scanDir = `${GLib.get_home_dir()}/Pictures`
    const files = new Set<string>()
    try {
        const dir = Gio.File.new_for_path(scanDir)
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
                files.add(`${scanDir}/${name}`)
            }
        }
        enumerator.close(null)
    } catch {
        // ignore
    }
    return Array.from(files).sort()
}

function applyWallpaper(path: string) {
    const escapedImage = path.replaceAll("\"", "\\\"")
    GLib.spawn_command_line_async("sh -lc 'pgrep -x swww-daemon >/dev/null || swww-daemon'")
    GLib.spawn_command_line_async(
        `swww img "${escapedImage}" --transition-type grow --transition-duration 1.0 --resize crop`
    )
}

function runJsonCommand(command: string) {
    try {
        const [ok, stdout] = GLib.spawn_command_line_sync(`sh -lc '${command}'`)
        if (!ok || !stdout) return null
        const text = new TextDecoder().decode(stdout as Uint8Array).trim()
        if (!text) return null
        return JSON.parse(text)
    } catch {
        return null
    }
}

function listWorkspaceCards() {
    const workspacesRaw = runJsonCommand("hyprctl -j workspaces")
    const clientsRaw = runJsonCommand("hyprctl -j clients")
    const activeRaw = runJsonCommand("hyprctl -j activeworkspace")

    const workspaces = Array.isArray(workspacesRaw) ? workspacesRaw : []
    const clients = Array.isArray(clientsRaw) ? clientsRaw : []
    const activeId = Number(activeRaw?.id ?? -1)

    const clientsByWorkspace = new Map<number, string[]>()
    clients.forEach((client: any) => {
        const workspaceId = Number(client?.workspace?.id ?? -1)
        if (workspaceId <= 0) return
        const title = String(client?.title ?? "").trim()
        const appClass = String(client?.class ?? "").trim()
        const label = title || appClass || "App"
        const items = clientsByWorkspace.get(workspaceId) ?? []
        items.push(label)
        clientsByWorkspace.set(workspaceId, items)
    })

    const ids = new Set<number>()
    workspaces.forEach((ws: any) => {
        const id = Number(ws?.id ?? -1)
        if (id > 0) ids.add(id)
    })
    clients.forEach((client: any) => {
        const id = Number(client?.workspace?.id ?? -1)
        if (id > 0) ids.add(id)
    })
    if (activeId > 0) ids.add(activeId)

    const maxId = Math.max(1, ...Array.from(ids))
    const workspaceMeta = new Map<number, any>()
    workspaces.forEach((ws: any) => {
        const id = Number(ws?.id ?? -1)
        if (id > 0) workspaceMeta.set(id, ws)
    })

    return Array.from({ length: maxId }, (_, index) => {
        const id = index + 1
        const meta = workspaceMeta.get(id)
        return {
            id,
            name: String(meta?.name ?? id),
            active: id === activeId,
            apps: clientsByWorkspace.get(id) ?? []
        }
    })
}

function getWorkspaceDotsLabel() {
    const items = listWorkspaceCards()
    if (items.length === 0) return "•"
    return items.map((workspace: any) => workspace.active ? "●" : "•").join(" ")
}

function switchWorkspace(id: number) {
    if (!Number.isFinite(id) || id <= 0) return
    GLib.spawn_command_line_async(`hyprctl dispatch workspace ${Math.floor(id)}`)
    closePanel()
}

function runSessionAction(action: "lock-screen" | "logout" | "sleep" | "reboot" | "poweroff") {
    const commands: Record<string, string> = {
        "lock-screen": "sh -lc 'command -v hyprlock >/dev/null && hyprlock || command -v swaylock >/dev/null && swaylock -f || loginctl lock-session'",
        "logout": "hyprctl dispatch exit",
        "sleep": "systemctl suspend",
        "reboot": "systemctl reboot",
        "poweroff": "systemctl poweroff"
    }
    const command = commands[action]
    GLib.spawn_command_line_async(`sh -lc '${command}'`)
    closePanel()
}

function iconFromDesktopFile(app: any) {
    try {
        const id = app.get_id?.()
        if (!id) return null
        const envData = GLib.getenv("XDG_DATA_DIRS") ?? ""
        const bases = [
            "/run/current-system/sw/share",
            `/etc/profiles/per-user/${GLib.get_user_name()}/share`,
            `${GLib.get_home_dir()}/.nix-profile/share`,
            "/usr/local/share",
            "/usr/share",
            ...envData.split(":").filter(Boolean)
        ]
        const iconTheme = getIconTheme()
        for (const base of bases) {
            const desktopPath = `${base}/applications/${id}`
            if (!GLib.file_test(desktopPath, GLib.FileTest.EXISTS)) continue
            const key = new GLib.KeyFile()
            key.load_from_file(desktopPath, GLib.KeyFileFlags.NONE)
            const iconValue = key.get_string("Desktop Entry", "Icon")
            if (!iconValue) continue
            if (iconValue.startsWith("/") && GLib.file_test(iconValue, GLib.FileTest.EXISTS)) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(iconValue, 32, 32, true)
                return (Gtk as any).Image.new_from_pixbuf(pixbuf)
            }
            const pixbuf = iconTheme?.load_icon?.(iconValue, 32, 0)
            if (pixbuf) return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
    } catch {
        // continue with next icon source
    }
    return null
}

function getIconTheme() {
    const iconTheme = (Gtk as any).IconTheme.get_default?.()
    if (iconTheme && !iconThemeInitialized) {
        iconThemeSearchPaths.forEach((path) => {
            iconTheme.append_search_path?.(path)
        })
        iconThemeInitialized = true
    }
    return iconTheme
}

function createAppImage(app: any) {
    try {
        const icon = app.get_icon?.()
        const iconString = icon?.to_string?.() ?? ""
        if (iconString.startsWith("/")) {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(iconString, 32, 32, true)
            return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
        const iconTheme = getIconTheme()
        const names = icon?.get_names?.() ?? []
        const info = iconTheme?.choose_icon?.(names, 32, 0)
        const filename = info?.get_filename?.()
        if (filename) {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(filename, 32, 32, true)
            return (Gtk as any).Image.new_from_pixbuf(pixbuf)
        }
        const appId = app.get_id?.()?.replace?.(".desktop", "")
        if (appId) return (Gtk as any).Image.new_from_icon_name(appId, (Gtk as any).IconSize.DIALOG)
        if (icon) {
            return (Gtk as any).Image.new_from_gicon(icon, (Gtk as any).IconSize.DIALOG)
        }
    } catch {
        // continue with fallback icon
    }
    const fromDesktop = iconFromDesktopFile(app)
    if (fromDesktop) return fromDesktop
    return (Gtk as any).Image.new_from_icon_name("application-x-executable", (Gtk as any).IconSize.DIALOG)
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    let appsEntryRef: any = null
    let appsQuery = ""
    let rerenderApps: (() => void) | null = null

    const syncAppsQuery = () => {
        appsQuery = String(appsEntryRef?.text ?? "").toLowerCase()
        rerenderApps?.()
    }

    const setAppsEntryText = (next: string) => {
        appsEntryRef?.set_text?.(next)
        if (appsEntryRef && !appsEntryRef.set_text) appsEntryRef.text = next
        appsEntryRef?.set_position?.(-1)
        syncAppsQuery()
    }

    const handleAppsTyping = (event: any, keyval: number) => {
        if (panelMode() !== "apps") return false
        const state = event?.get_state?.()[1] ?? event?.state ?? 0
        const blockedMask =
            (Gdk.ModifierType.CONTROL_MASK ?? 0)
            | (Gdk.ModifierType.MOD1_MASK ?? 0)
            | (Gdk.ModifierType.SUPER_MASK ?? 0)
        if ((state & blockedMask) !== 0) return false

        if (keyval === (Gdk.KEY_BackSpace ?? 65288)) {
            const current = String(appsEntryRef?.text ?? "")
            if (current.length > 0) setAppsEntryText(current.slice(0, -1))
            return true
        }

        const unicode = Gdk.keyval_to_unicode?.(keyval) ?? 0
        if (!unicode) return false
        const character = String.fromCodePoint(unicode)
        if (character.length === 0 || character === "\u0000") return false

        const current = String(appsEntryRef?.text ?? "")
        setAppsEntryText(`${current}${character}`)
        return true
    }

    const getModeSize = (mode: string) => {
        const geometry = (gdkmonitor as any)?.get_geometry?.()
        const monitorWidth = geometry?.width ?? 2560
        const horizontalInset = 0
        const fullWidth = Math.max(600, monitorWidth - horizontalInset)
        if (mode === "apps") return { width: Math.round(monitorWidth * 0.6), height: 400 }
        if (mode === "wallpaper") return { width: Math.max(1320, Math.round(monitorWidth * 0.5)), height: 280 }
        if (mode === "workspaces") return { width: Math.max(1320, Math.round(monitorWidth * 0.56)), height: 300 }
        if (mode === "session") return { width: 260, height: 64 }
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
        setup={(self: any) => {
            self.set_can_focus?.(true)
            panelMode.subscribe((mode: string) => {
                const active = mode !== "none"
                const nextKeymode = active ? Astal.Keymode.EXCLUSIVE : Astal.Keymode.ON_DEMAND
                self.keymode = nextKeymode
                self.set_keymode?.(nextKeymode)
                if (!active) return
                GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                    self.present?.()
                    self.grab_focus?.()
                    return false
                })
            })
        }}
        onKeyPressEvent={(_: any, event: any) => {
            const keyval = event?.get_keyval?.()[1] ?? event?.keyval
            if (keyval === (Gdk.KEY_Escape ?? 65307)) {
                closePanel()
                return true
            }
            return handleAppsTyping(event, keyval)
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
            halign={0}
            hexpand={true}
            vertical
        >
            <Navbar />

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
                        onChanged={(self: any) => {
                            appsQuery = String(self.text ?? "").toLowerCase()
                            rerenderApps?.()
                        }}
                        setup={(self: any) => {
                            appsEntryRef = self
                            panelMode.subscribe((mode: string) => {
                                if (mode === "apps") {
                                    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                                        appsEntryRef?.grab_focus?.()
                                        appsEntryRef?.set_position?.(-1)
                                        appsQuery = String(appsEntryRef?.text ?? "").toLowerCase()
                                        rerenderApps?.()
                                        return false
                                    })
                                }
                            })
                        }}
                    />
                    <box
                        className="apps-menu-scroll"
                        vexpand
                        setup={(self: any) => {
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
                            grid.set_column_homogeneous?.(true)
                            const columns = 6

                            const renderApps = () => {
                                grid.get_children?.().forEach((child: any) => grid.remove(child))
                                const apps = getApps()
                                const filtered = apps.filter((entry: any) => {
                                    const name = String(entry.name ?? "").toLowerCase()
                                    const id = String(entry.app?.get_id?.() ?? "").toLowerCase()
                                    return appsQuery.length === 0 || name.includes(appsQuery) || id.includes(appsQuery)
                                })

                                filtered.forEach((entry: any, index: number) => {
                                    const button = (Gtk as any).Button.new()
                                    button.get_style_context?.()?.add_class("apps-tile")
                                    button.set_hexpand?.(true)

                                    const content = (Gtk as any).Box.new((Gtk as any).Orientation.VERTICAL, 4)
                                    content.set_halign?.((Gtk as any).Align.CENTER)
                                    content.set_valign?.((Gtk as any).Align.CENTER)
                                    const image = createAppImage(entry.app)
                                    image.set_pixel_size?.(28)

                                    const label = (Gtk as any).Label.new(entry.name)
                                    label.set_max_width_chars?.(14)
                                    label.set_ellipsize?.(3)
                                    label.set_xalign?.(0.5)
                                    label.set_justify?.((Gtk as any).Justification.CENTER)

                                    content.pack_start?.(image, false, false, 0)
                                    content.pack_start?.(label, false, false, 0)
                                    button.add(content)

                                    button.connect("clicked", () => {
                                        entry.app.launch([], null)
                                        closePanel()
                                    })

                                    const col = index % columns
                                    const row = Math.floor(index / columns)
                                    grid.attach(button, col, row, 1, 1)
                                })
                                grid.show_all?.()
                            }

                            rerenderApps = renderApps
                            renderApps()

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
                            const files = listPictureFiles()
                            const scroll = (Gtk as any).ScrolledWindow.new(null, null)
                            const hPolicy = (Gtk as any).PolicyType.AUTOMATIC ?? 1
                            const vPolicy = (Gtk as any).PolicyType.NEVER ?? 2
                            scroll.set_policy?.(hPolicy, vPolicy)
                            scroll.set_hexpand?.(true)
                            scroll.set_vexpand?.(true)
                            scroll.set_can_focus?.(true)
                            const tileWidth = 230
                            const tileHeight = 132
                            const tileGap = 12
                            const visibleCount = 5
                            const step = tileWidth + tileGap
                            const viewportWidth = visibleCount * tileWidth + (visibleCount - 1) * tileGap
                            scroll.set_size_request?.(viewportWidth, tileHeight + 10)

                            const row = (Gtk as any).Box.new((Gtk as any).Orientation.HORIZONTAL, tileGap)
                            const hadj = scroll.get_hadjustment?.()

                            const snapTo = (value: number) => {
                                if (!hadj) return
                                const upper = hadj.get_upper?.() ?? 0
                                const page = hadj.get_page_size?.() ?? 0
                                const max = Math.max(0, upper - page)
                                const clamped = Math.max(0, Math.min(max, value))
                                const snapped = Math.round(clamped / step) * step
                                const next = Math.max(0, Math.min(max, snapped))
                                hadj.set_value?.(next)
                            }

                            const scrollByStep = (dir: number) => {
                                if (!hadj) return
                                const current = hadj.get_value?.() ?? 0
                                const currentIndex = Math.round(current / step)
                                snapTo((currentIndex + dir) * step)
                            }

                            scroll.connect?.("key-press-event", (_: any, event: any) => {
                                const keyval = event?.get_keyval?.()[1] ?? event?.keyval
                                if (keyval === 65361) {
                                    scrollByStep(-1)
                                    return true
                                }
                                if (keyval === 65363) {
                                    scrollByStep(1)
                                    return true
                                }
                                return false
                            })
                            scroll.connect?.("scroll-event", (_: any, event: any) => {
                                const deltas = event?.get_scroll_deltas?.()
                                if (deltas && deltas[0]) {
                                    const dx = deltas[1] ?? 0
                                    const dy = deltas[2] ?? 0
                                    const value = Math.abs(dx) > 0.01 ? dx : dy
                                    if (Math.abs(value) > 0.01) {
                                        scrollByStep(value > 0 ? 1 : -1)
                                        return true
                                    }
                                }
                                const dir = event?.get_scroll_direction?.()
                                if (dir === 0) {
                                    scrollByStep(-1)
                                    return true
                                }
                                if (dir === 1) {
                                    scrollByStep(1)
                                    return true
                                }
                                return false
                            })

                            files.forEach((path) => {
                                try {
                                    const button = (Gtk as any).Button.new()
                                    button.get_style_context?.()?.add_class("wallpaper-tile")
                                    const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, tileWidth, tileHeight, true)
                                    const image = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                                    button.add(image)

                                    button.connect("clicked", () => {
                                        applyWallpaper(path)
                                        closePanel()
                                    })
                                    row.pack_start?.(button, false, false, 0)
                                } catch {
                                    // skip broken file
                                }
                            })

                            if (files.length === 0) {
                                const empty = (Gtk as any).Label.new("No wallpapers found")
                                empty.get_style_context?.()?.add_class("wallpaper-empty")
                                self.add(empty)
                                self.show_all?.()
                                return
                            }

                            scroll.add(row)
                            self.add(scroll)
                            self.show_all?.()
                        }}
                    />
                </box>
                <box
                    setup={(self: any) => {
                        self.visible = panelMode() === "workspaces"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "workspaces"
                        })
                    }}
                    vertical
                >
                    <label className="workspace-title" label="Workspaces" />
                    <box
                        className="workspace-block"
                        setup={(self: any) => {
                            self.get_children?.().forEach((child: any) => self.remove(child))
                            const items = listWorkspaceCards()

                            if (items.length === 0) {
                                const empty = (Gtk as any).Label.new("No workspaces found")
                                empty.get_style_context?.()?.add_class("workspace-empty")
                                self.add(empty)
                                self.show_all?.()
                                return
                            }

                            const scroll = (Gtk as any).ScrolledWindow.new(null, null)
                            const hPolicy = (Gtk as any).PolicyType.AUTOMATIC ?? 1
                            const vPolicy = (Gtk as any).PolicyType.NEVER ?? 2
                            scroll.set_policy?.(hPolicy, vPolicy)
                            scroll.set_hexpand?.(true)
                            scroll.set_vexpand?.(true)

                            const row = (Gtk as any).Box.new((Gtk as any).Orientation.HORIZONTAL, 12)
                            items.forEach((workspace: any) => {
                                const button = (Gtk as any).Button.new()
                                button.get_style_context?.()?.add_class("workspace-tile")
                                if (workspace.active) button.get_style_context?.()?.add_class("active")

                                const card = (Gtk as any).Box.new((Gtk as any).Orientation.VERTICAL, 6)
                                card.get_style_context?.()?.add_class("workspace-card")

                                const title = (Gtk as any).Label.new(`Workspace ${workspace.id}`)
                                title.get_style_context?.()?.add_class("workspace-tile-header")
                                title.set_xalign?.(0)
                                card.pack_start?.(title, false, false, 0)

                                const preview = (Gtk as any).Box.new((Gtk as any).Orientation.VERTICAL, 3)
                                preview.get_style_context?.()?.add_class("workspace-preview")
                                const previewItems = workspace.apps.length > 0
                                    ? workspace.apps.slice(0, 4)
                                    : ["Empty"]

                                previewItems.forEach((item: string) => {
                                    const appLabel = (Gtk as any).Label.new(item)
                                    appLabel.get_style_context?.()?.add_class("workspace-app")
                                    appLabel.set_xalign?.(0)
                                    appLabel.set_ellipsize?.(3)
                                    appLabel.set_max_width_chars?.(26)
                                    preview.pack_start?.(appLabel, false, false, 0)
                                })

                                card.pack_start?.(preview, true, true, 0)
                                button.add(card)
                                button.connect("clicked", () => switchWorkspace(workspace.id))
                                row.pack_start?.(button, false, false, 0)
                            })

                            scroll.add(row)
                            self.add(scroll)
                            self.show_all?.()
                        }}
                    />
                </box>
                <box
                    className="session-block"
                    setup={(self: any) => {
                        self.visible = panelMode() === "session"
                        panelMode.subscribe((mode: string) => {
                            self.visible = mode === "session"
                        })
                    }}
                >
                    <button
                        className="session-action session-action-icon"
                        onClicked={() => runSessionAction("lock-screen")}
                        setup={(self: any) => {
                            const icon = (Gtk as any).Image.new_from_icon_name("system-lock-screen-symbolic", (Gtk as any).IconSize.BUTTON)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label?.("")
                        }}
                    />
                    <button
                        className="session-action session-action-icon"
                        onClicked={() => runSessionAction("logout")}
                        setup={(self: any) => {
                            const icon = (Gtk as any).Image.new_from_icon_name("system-log-out-symbolic", (Gtk as any).IconSize.BUTTON)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label?.("")
                        }}
                    />
                    <button
                        className="session-action session-action-icon"
                        onClicked={() => runSessionAction("sleep")}
                        setup={(self: any) => {
                            const icon = (Gtk as any).Image.new_from_icon_name("system-suspend-symbolic", (Gtk as any).IconSize.BUTTON)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label?.("")
                        }}
                    />
                    <button
                        className="session-action session-action-icon"
                        onClicked={() => runSessionAction("reboot")}
                        setup={(self: any) => {
                            const icon = (Gtk as any).Image.new_from_icon_name("system-reboot-symbolic", (Gtk as any).IconSize.BUTTON)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label?.("")
                        }}
                    />
                    <button
                        className="session-action session-action-icon danger"
                        onClicked={() => runSessionAction("poweroff")}
                        setup={(self: any) => {
                            const icon = (Gtk as any).Image.new_from_icon_name("system-shutdown-symbolic", (Gtk as any).IconSize.BUTTON)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label?.("")
                        }}
                    />
                </box>
            </box>
        </box>
    </window>
}
