import GLib from "gi://GLib"

export function runCommand(command: string) {
    return GLib.spawn_command_line_async(command)
}

export function runJsonCommand(command: string) {
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
