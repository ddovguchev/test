import { AppsButton } from "../left-side/AppsButton"
import { ClockLabel } from "../left-side/ClockLabel"
import { WorkspacesButton } from "./WorkspacesButton"
import { NotificationsButton } from "./NotificationsButton"
import { PublicIpLabel } from "./PublicIpLabel"
import { SessionButton } from "./SessionButton"

export function RightSide() {
    return (
        <box>
            <AppsButton />
            <ClockLabel />
            <WorkspacesButton />
            <NotificationsButton />
            <SessionButton />
            <PublicIpLabel />
        </box>
    )
}
