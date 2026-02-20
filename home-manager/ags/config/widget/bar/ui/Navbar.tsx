import { LeftSide } from "./left-side/LeftSide"
import { CenterSide } from "./center-side/CenterSide"
import { RightSide } from "./right-side/RightSide"
import { panelMode } from "../../launcherState"

export function Navbar() {
    return (
        <centerbox
            className="shell-top-row"
            setup={(self: { visible?: boolean }) => {
                self.visible = panelMode() === "none"
                panelMode.subscribe((mode: string) => {
                    self.visible = mode === "none"
                })
            }}
        >
            <LeftSide />
            <CenterSide />
            <RightSide />
        </centerbox>
    )
}
