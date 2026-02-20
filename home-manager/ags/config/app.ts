import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { closePanel, setPanelMode, togglePanelMode } from "./widget/launcherState"

App.start({
    css: style,
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
        })
    }
})
