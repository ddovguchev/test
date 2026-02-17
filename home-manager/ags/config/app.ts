import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import InteractionBackdrop from "./widget/InteractionBackdrop"

App.start({
    css: style,
    main() {
        App.get_monitors().forEach((monitor) => {
            InteractionBackdrop(monitor)
            Bar(monitor)
        })
    }
})
