import app from "ags/gtk3/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { closePanel, setPanelMode, togglePanelMode } from "./widget/launcherState"

app.start({
    css: style,
    requestHandler(args: string[], response: (res: string) => void) {
        const request = args[0] ?? ""
        switch (request) {
            case "apps":
                togglePanelMode("apps")
                response("ok")
                break
            case "notifications":
                togglePanelMode("notifications")
                response("ok")
                break
            case "wallpaper":
                togglePanelMode("wallpaper")
                response("ok")
                break
            case "session":
                togglePanelMode("session")
                response("ok")
                break
            case "close":
                closePanel()
                response("ok")
                break
            case "none":
                setPanelMode("none")
                response("ok")
                break
            default:
                response("unknown-request")
        }
    },
    main() {
        app.get_monitors().forEach((monitor) => {
            Bar(monitor)
        })
    }
})
