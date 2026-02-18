import app from "ags/gtk3/app"
import style from "./style.scss"
import Bar from "./widget/Bar"

app.start({
    css: style,
    requestHandler(args: string[], response: (res: string) => void) {
        response("ok")
    },
    main() {
        const monitors = app.get_monitors()
        if (monitors.length === 0) return null
        return Bar(monitors[0])
    },
})
