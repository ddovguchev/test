import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import PanelOverlay from "./widget/PanelOverlay"

App.start({
    css: style,
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
            PanelOverlay(monitor)
        })
    }
})
