import { Gtk } from "astal/gtk3"
import { togglePanelMode } from "../../../../shared/config"

export function SessionButton() {
    return (
        <button
            className="session-button"
            onClicked={() => togglePanelMode("session")}
            halign={Gtk.Align.CENTER}
        >
            ⏻
        </button>
    )
}
