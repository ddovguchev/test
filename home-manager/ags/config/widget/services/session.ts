import { closePanel } from "../launcherState"
import { runCommand } from "../shared/shell"

type SessionAction = "lock-screen" | "logout" | "sleep" | "reboot" | "poweroff"

const SESSION_COMMANDS: Record<SessionAction, string> = {
    "lock-screen": "sh -lc 'if command -v hyprlock >/dev/null 2>&1; then pkill -x hyprlock >/dev/null 2>&1 || true; exec hyprlock; elif command -v swaylock >/dev/null 2>&1; then exec swaylock -f; else exec loginctl lock-session; fi'",
    "logout": "hyprctl dispatch exit",
    "sleep": "systemctl suspend",
    "reboot": "systemctl reboot",
    "poweroff": "systemctl poweroff",
}

export function runSessionAction(action: SessionAction) {
    runCommand(SESSION_COMMANDS[action])
    closePanel()
}
