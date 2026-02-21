import app from "astal/gtk4/app";
import { type Gdk } from "astal/gtk4";
import style from "./style.scss";
import Bar from "./widget/Bar";
import AppMenu from "./widget/AppMenu";
import MenuOverlay from "./widget/MenuOverlay";
import NotificationOverlay from "./widget/NotificationOverlay";
import PowerMenu from "./widget/PowerMenu";

app.start({
  css: style,
  main() {
    const monitors = app.get_monitors();
    for (const m of monitors) {
      Bar(m as Gdk.Monitor);
    }
    const first = monitors[0];
    if (first) {
      AppMenu(first as Gdk.Monitor);
      MenuOverlay(first as Gdk.Monitor);
      NotificationOverlay(first as Gdk.Monitor);
      PowerMenu(first as Gdk.Monitor);
    }
  },
});
