import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { closePanel, setPanelMode, togglePanelMode } from "./widget/launcherState"

App.start({
    css: style,
    requestHandler(request: string) {
        switch (request) {
            case "apps":
                togglePanelMode("apps")
                return "ok"
            case "notifications":
                togglePanelMode("notifications")
                return "ok"
            case "wallpaper":
                togglePanelMode("wallpaper")
                return "ok"
            case "workspaces":
                togglePanelMode("workspaces")
                return "ok"
            case "session":
                togglePanelMode("session")
                return "ok"
            case "close":
                closePanel()
                return "ok"
            case "none":
                setPanelMode("none")
                return "ok"
            default:
                return "unknown-request"
        }
    },
    main() {
        App.get_monitors().forEach((monitor) => {
            Bar(monitor)
        })
    }
})
