import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { handleAppRequest } from "./widget/requestHandler"

App.start({
    css: style,
    requestHandler(request: string) {
        return handleAppRequest(request)
    },
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
        })
    }
})
