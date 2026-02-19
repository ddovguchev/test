import { Variable } from "astal"
import { Gtk } from "astal/gtk3"

const publicIp = Variable("...").poll(60000, "curl -s --max-time 3 ifconfig.me 2>/dev/null || curl -s --max-time 3 icanhazip.com 2>/dev/null || echo '—'")

export function PublicIpLabel() {
    return (
        <label
            className="public-ip-label"
            label={publicIp()}
            halign={Gtk.Align.CENTER}
        />
    )
}
