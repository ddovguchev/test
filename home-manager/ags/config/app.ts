import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar, { Launcher } from "./widget/Bar"

App.start({
    css: style,
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
            Launcher(monitor)
        })
    }
})
