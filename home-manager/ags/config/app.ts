import app from "ags/gtk3/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { handleAppRequest } from "./widget/requestHandler"

app.start({
    css: style,
    requestHandler(args: string[], response: (res: string) => void) {
        const request = args[0] ?? ""
        response(handleAppRequest(request))
    },
    main() {
        app.get_monitors().forEach((monitor) => {
            Bar(monitor)
        })
    }
})
