import { Gtk } from "astal/gtk3"
import GdkPixbuf from "gi://GdkPixbuf"
import { togglePanelMode } from "../../../launcherState"

const appsIcon = `${SRC}/assets/icons/apps-svgrepo-com.svg`

export function AppsButton() {
    return (
        <button
            className="apps-button"
            onClicked={() => togglePanelMode("apps")}
            setup={(self: Gtk.Button) => {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(appsIcon, 14, 14, true)
                const icon = (Gtk as { Image: { new_from_pixbuf: (p: unknown) => Gtk.Widget } }).Image.new_from_pixbuf(pixbuf)
                self.set_image(icon)
                self.set_always_show_image?.(true)
                self.set_label("")
            }}
            halign={Gtk.Align.CENTER}
        />
    )
}
