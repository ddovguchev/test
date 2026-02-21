import app from "astal/gtk4/app";
import { type Gdk } from "astal/gtk4";
import style from "./style.scss";
import Bar from "./widget/Bar";

app.start({
  css: style,
  main() {
    const monitors = app.get_monitors();
    for (const m of monitors) {
      Bar(m as Gdk.Monitor);
    }
  },
});
