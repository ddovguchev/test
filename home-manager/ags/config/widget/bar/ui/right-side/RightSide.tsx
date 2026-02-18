import { WorkspacesButton } from "./WorkspacesButton"
import { NotificationsButton } from "./NotificationsButton"
import { SessionButton } from "./SessionButton"

export function RightSide() {
    return (
        <box>
            <WorkspacesButton />
            <NotificationsButton />
            <SessionButton />
        </box>
    )
}
