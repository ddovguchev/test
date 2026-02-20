import { Variable } from "astal"
import { panelMode } from "../../../launcherState"

const time = Variable("").poll(1000, "date +'%I:%M %p'")

export function ClockLabel() {
    return (
        <label
            className="clock-label"
            label={time()}
            setup={(self: { visible?: boolean }) => {
                self.visible = panelMode() === "none"
                panelMode.subscribe((mode: string) => {
                    self.visible = mode === "none"
                })
            }}
        />
    )
}
