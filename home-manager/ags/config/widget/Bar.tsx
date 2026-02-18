import app from "ags/gtk3/app"
import { Astal, Gtk } from "ags/gtk3"
import type { Gdk } from "ags/gtk3"
import GLib from "gi://GLib"
import Gdk from "gi://Gdk"
import GdkPixbuf from "gi://GdkPixbuf"
import { closePanel, panelMode, togglePanelMode } from "./launcherState"
import { APPS_ICON, NOTIFICATIONS_ICON } from "./shared/icons"
import { getModeSize } from "./shared/mode"
import { getApps, createAppImage } from "./services/apps"
import { listPictureFiles, applyWallpaper } from "./services/wallpapers"
import { getWorkspaceDotsLabel, listWorkspaceCards, switchWorkspace } from "./services/workspaces"
import { runSessionAction } from "./services/session"
import { setupVisibleWhenMode, setupVisibleWhenNone, setupVisibleWhenPanelOpen } from "./panelVisibility"
import { clockTime } from "./shared/state"

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

    return <window
        name="bar"
        namespace="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        keymode={Astal.Keymode.ON_DEMAND}
        $={(self: any) => {
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
        application={app}>
        <box
            class="shell-panel mode-none"
            $={(self: any) => {
                const initial = getModeSize(gdkmonitor, panelMode())
                let currentWidth = initial.width
                let currentHeight = initial.height
                let animationId = 0

                self.set_size_request(initial.width, initial.height)
                panelMode.subscribe((mode: string) => {
                    const ctx = self.get_style_context?.()
                    if (ctx) {
                        ["mode-none", "mode-apps", "mode-wallpaper", "mode-session", "mode-notifications", "mode-workspaces"].forEach((c) => ctx.remove_class(c))
                        ctx.add_class(`mode-${mode}`)
                    }
                    const target = getModeSize(gdkmonitor, mode)
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
                class="shell-top-row"
                hexpand
                halign={Gtk.Align.FILL}
                $={setupVisibleWhenNone}
            >
                <box halign={Gtk.Align.START}>
                    <button
                        class="apps-button"
                        onClicked={() => togglePanelMode("apps")}
                        $={(self: any) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(APPS_ICON, 14, 14, true)
                            const icon = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label("")
                        }}
                        halign={Gtk.Align.CENTER}
                    />
                    <label
                        class="clock-label"
                        label={clockTime()}
                        $={(self: any) => {
                            setupVisibleWhenNone(self)
                            clockTime.subscribe((v: string) => { self.set_label?.(v) })
                        }}
                    />
                </box>
                <box halign={Gtk.Align.CENTER}>
                    <button
                        class="workspaces-button"
                        onClicked={() => togglePanelMode("workspaces")}
                        $={(self: any) => {
                            const refresh = () => {
                                self.set_label?.(getWorkspaceDotsLabel())
                                if (!self.set_label) self.label = getWorkspaceDotsLabel()
                            }
                            refresh()
                            const timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1200, () => {
                                refresh()
                                return true
                            })
                            self.connect?.("destroy", () => {
                                if (timerId) GLib.source_remove(timerId)
                            })
                        }}
                        halign={Gtk.Align.CENTER}
                    />
                    <button
                        class="notifications-button"
                        onClicked={() => togglePanelMode("notifications")}
                        $={(self: any) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(NOTIFICATIONS_ICON, 14, 14, true)
                            const icon = (Gtk as any).Image.new_from_pixbuf(pixbuf)
                            self.set_image(icon)
                            self.set_always_show_image?.(true)
                            self.set_label("")
                        }}
                        halign={Gtk.Align.CENTER}
                    />
                </box>
                <box halign={Gtk.Align.END}>
                    <button
                        class="session-button"
                        onClicked={() => togglePanelMode("session")}
                        halign={Gtk.Align.END}
                    >
                        ⏻
                    </button>
                </box>
            </centerbox>

            <box
                class="shell-content"
                $={setupVisibleWhenPanelOpen}
                vertical
            >
                <box
                    $={(self: any) => setupVisibleWhenMode(self, "apps")}
                    vertical
                >
                    <entry
                        class="apps-input"
                        placeholderText="Search app..."
                        onChanged={(self: any) => {
                            appsQuery = String(self.text ?? "").toLowerCase()
                            rerenderApps?.()
                        }}
                        $={(self: any) => {
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
                        class="apps-menu-scroll"
                        vexpand
                        $={(self: any) => {
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
                    $={(self: any) => setupVisibleWhenMode(self, "notifications")}
                    vertical
                />

                <box
                    $={(self: any) => setupVisibleWhenMode(self, "wallpaper")}
                    vertical
                >
                    <label class="wallpaper-title" label="Select wallpapers" />
                    <box
                        class="wallpaper-block"
                        $={(self: any) => {
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
                    $={(self: any) => setupVisibleWhenMode(self, "workspaces")}
                    vertical
                >
                    <label class="workspace-title" label="Workspaces" />
                    <box
                        class="workspace-block"
                        $={(self: any) => {
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
                    $={(self: any) => setupVisibleWhenMode(self, "session")}
                    vertical
                >
                    <box class="session-title-row">
                        <label class="session-title" label="Session" />
                    </box>
                    <box class="session-actions" spacing={8} halign={Gtk.Align.START}>
                        <button class="session-action lock" onClicked={() => runSessionAction("lock-screen")}>
                            Lock
                        </button>
                        <button class="session-action" onClicked={() => runSessionAction("logout")}>
                            Logout
                        </button>
                        <button class="session-action" onClicked={() => runSessionAction("sleep")}>
                            Sleep
                        </button>
                        <button class="session-action" onClicked={() => runSessionAction("reboot")}>
                            Reboot
                        </button>
                        <button class="session-action danger" onClicked={() => runSessionAction("poweroff")}>
                            Poweroff
                        </button>
                    </box>
                </box>
            </box>
        </box>
    </window>
}
