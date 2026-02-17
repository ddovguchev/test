import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import Launcher from "./widget/Launcher"

App.start({
    css: style,
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
            Launcher(monitor)
        })
    }
})
